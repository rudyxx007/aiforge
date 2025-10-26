variable "project_id" {
  description = "The GCP project ID to deploy to"
  type        = string
  default     = "aiforge-474923"
}

variable "region" {
  description = "The GCP region to deploy resources in"
  type        = string
  default     = "us-central1"
}

variable "db_password" {
  description = "The password for the Cloud SQL database"
  type        = string
  sensitive   = true # This hides it from logs
}

variable "db_user" {
  description = "The username for the Cloud SQL database"
  type        = string
  default     = "aiforge_user"
}