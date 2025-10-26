output "gke_cluster_name" {
  description = "The name of the GKE cluster"
  value       = google_container_cluster.primary.name
}

output "gke_cluster_endpoint" {
  description = "The public endpoint of the GKE cluster"
  value       = google_container_cluster.primary.endpoint
}

output "db_instance_name" {
  description = "The name of the Cloud SQL instance"
  value       = google_sql_database_instance.aiforge_db.name
}

output "db_private_ip" {
  description = "The private IP address of the Cloud SQL instance"
  value       = google_sql_database_instance.aiforge_db.private_ip_address
}

output "db_connection_name" {
  description = "The connection name for the Cloud SQL instance (used by proxies)"
  value = google_sql_database_instance.aiforge_db.connection_name
}

output "gcs_bucket_name" {
  description = "The name of the GCS bucket"
  value       = google_storage_bucket.aiforge_bucket.name
}

output "artifact_registry_name" {
  description = "The full name of the Docker Artifact Registry"
  value       = google_artifact_registry_repository.aiforge_repo.name
}