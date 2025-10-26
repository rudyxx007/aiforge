# -----------------------------------------------------------------------------
# 1. CONFIGURE TERRAFORM & GOOGLE PROVIDER
# -----------------------------------------------------------------------------
terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

# Configure the Google Cloud provider
provider "google" {
  project     = var.project_id
  region      = var.region
  credentials = file("gcp-credentials.json") # Tells Terraform to use our secret key
}

# -----------------------------------------------------------------------------
# 2. NETWORKING (VPC)
# -----------------------------------------------------------------------------
resource "google_compute_network" "aiforge_vpc" {
  name                    = "aiforge-vpc"
  auto_create_subnetworks = false # We want to create our own (best practice)
}

resource "google_compute_subnetwork" "aiforge_subnet" {
  name          = "aiforge-subnet"
  ip_cidr_range = "10.10.0.0/24"
  region        = var.region
  network       = google_compute_network.aiforge_vpc.id
}

# -----------------------------------------------------------------------------
# 3. GKE (KUBERNETES) CLUSTER
# -----------------------------------------------------------------------------
resource "google_container_cluster" "primary" {
  name     = "aiforge-cluster"
  location = var.region

  # Use our custom VPC
  network    = google_compute_network.aiforge_vpc.id
  subnetwork = google_compute_subnetwork.aiforge_subnet.id

  # Small initial node pool to save credits
  initial_node_count = 1
  remove_default_node_pool = true # We will define our own node pool
}

# Define a specific node pool (the actual computers)
resource "google_container_node_pool" "primary_nodes" {
  name       = "default-node-pool"
  cluster    = google_container_cluster.primary.id
  location   = var.region
  node_count = 1

  node_config {
    # This is a very small, cheap machine type. Good for your $50 credit.
    machine_type = "e2-small" 
    
    oauth_scopes = [
      "https://www.googleapis.com/auth/cloud-platform"
    ]
  }
}

# -----------------------------------------------------------------------------
# 4. CLOUD SQL (POSTGRESQL) DATABASE
# -----------------------------------------------------------------------------

# This is the "Private Service Connection" needed for a private IP
resource "google_compute_global_address" "private_ip_address" {
  name          = "aiforge-db-private-ip"
  purpose       = "VPC_PEERING"
  address_type  = "INTERNAL"
  prefix_length = 16
  network       = google_compute_network.aiforge_vpc.id
}

resource "google_service_networking_connection" "private_vpc_connection" {
  network                 = google_compute_network.aiforge_vpc.id
  service                 = "servicenetworking.googleapis.com"
  reserved_peering_ranges = [google_compute_global_address.private_ip_address.name]
}

# This is the actual PostgreSQL database instance
resource "google_sql_database_instance" "aiforge_db" {
  name             = "aiforge-db-instance"
  region           = var.region
  database_version = "POSTGRES_14"

  settings {
    # This is the smallest, cheapest tier. Perfect for your $50 credit.
    tier = "db-f1-micro"

    ip_configuration {
      ipv4_enabled    = false # No public IP!
      private_network = google_compute_network.aiforge_vpc.id
    }
  }

  # This makes Terraform wait for the private connection to be ready
  # before trying to create the database.
  depends_on = [google_service_networking_connection.private_vpc_connection]
}

# This creates the logical database inside the instance
resource "google_sql_database" "database" {
  name     = "aiforge-main-db"
  instance = google_sql_database_instance.aiforge_db.name
}

# This creates the user for your microservices
resource "google_sql_user" "db_user" {
  name     = var.db_user
  instance = google_sql_database_instance.aiforge_db.name
  password = var.db_password
}

# -----------------------------------------------------------------------------
# 5. GCS (STORAGE) BUCKET
# -----------------------------------------------------------------------------
resource "google_storage_bucket" "aiforge_bucket" {
  # Bucket names must be GLOBALLY unique, so we add a random suffix
  name          = "aiforge-project-bucket-${random_id.bucket_suffix.hex}"
  location      = "US" # GCS locations are multi-regional (e.g., "US")
  force_destroy = true # Allows Terraform to delete the bucket even if it's not empty
}

# Helper to create a random string for the bucket name
resource "random_id" "bucket_suffix" {
  byte_length = 8
}

# -----------------------------------------------------------------------------
# 6. ARTIFACT REGISTRY (FOR DOCKER IMAGES)
# -----------------------------------------------------------------------------
resource "google_artifact_registry_repository" "aiforge_repo" {
  location      = var.region
  repository_id = "aiforge-services" # Name of our Docker repo
  description   = "Docker repository for AiForge microservices"
  format        = "DOCKER"
}