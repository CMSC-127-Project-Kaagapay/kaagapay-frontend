// src/lib/api.ts

const API_BASE_URL = "http://localhost:8000"; // Define your API base URL here

interface ApplicationForm {
  first_name: string;
  last_name: string;
  motivation: string;
  public_alias: string;
  email: string;
  external_handle: string;
}

export interface VolunteerResponseDto {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  public_alias: string;
  external_handle: string;
  profile_image_url?: string;
  status: string;
  incentive_points: number;
  office_id?: string;
}

interface VolunteerApplicationResponseDto {
  application_id: string;
  first_name: string;
  last_name: string;
  motivation: string;
  public_alias: string;
  email: string;
  external_handle: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  updated_at: string;
}

export interface ReportForm {
  demographic: string;
  involved_party: string;
  locality: string;
  routing_type: "random" | "specific";
  selected_volunteer_id: string | null;
}

export interface ReportResponseDto {
  public_case_id: string;
  status:
    | "requested"
    | "pending"
    | "claimed"
    | "under_review"
    | "resolved"
    | "closed";
  demographic: string;
  involved_party: string;
  locality: string;
  created_at: string;
}

export interface VolunteerPublicRecord {
  id: string;
  first_name: string;
  last_name: string;
  status: string;
  profile_image_url: string | null;
}

// Function to handle API responses and throw errors for non-OK status
async function handleApiResponse(response: Response) {
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      errorData.detail || `API request failed with status ${response.status}`,
    );
  }
  return response.json();
}

/**
 * Submits a new volunteer application.
 * @param applicationData The data for the volunteer application.
 * @returns A promise that resolves with the API response.
 */
export async function submitVolunteerApplication(
  applicationData: ApplicationForm,
): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/volunteer-applications`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(applicationData),
  });
  return handleApiResponse(response);
}

/**
 * Fetches all volunteer applications.
 * @param token The authentication token for the request.
 * @returns A promise that resolves with an array of volunteer applications.
 */
export async function getVolunteerApplications(
  token: string,
): Promise<VolunteerApplicationResponseDto[]> {
  const response = await fetch(`${API_BASE_URL}/volunteer-applications`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return handleApiResponse(response);
}

/**
 * Approves a volunteer application.
 * @param applicationId The ID of the application to approve.
 * @param token The authentication token for the request.
 * @returns A promise that resolves with the API response.
 */
export async function approveVolunteerApplication(
  applicationId: string,
  token: string,
): Promise<any> {
  const response = await fetch(
    `${API_BASE_URL}/volunteer-applications/${applicationId}/approve`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    },
  );
  return handleApiResponse(response);
}

/**
 * Rejects a volunteer application.
 * @param applicationId The ID of the application to reject.
 * @param token The authentication token for the request.
 * @returns A promise that resolves with the API response.
 */
export async function rejectVolunteerApplication(
  applicationId: string,
  token: string,
): Promise<any> {
  const response = await fetch(
    `${API_BASE_URL}/volunteer-applications/${applicationId}/reject`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    },
  );
  return handleApiResponse(response);
}

/**
 * Submits a new incident report.
 * @param reportData The data for the incident report.
 * @returns A promise that resolves with the public case ID and status from the backend.
 */
export async function submitReport(
  reportData: ReportForm,
): Promise<ReportResponseDto> {
  const response = await fetch(`${API_BASE_URL}/incidents`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(reportData),
  });
  return handleApiResponse(response);
}

/**
 * Fetches all active volunteers for public display.
 * @returns A promise that resolves with an array of active volunteer records.
 */
export async function getActiveVolunteers(): Promise<VolunteerPublicRecord[]> {
  const response = await fetch(`${API_BASE_URL}/volunteers`, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  return handleApiResponse(response);
}

export interface IncidentTicketResponseDto {
  id: string;
  public_case_id: string;
  demographic: string;
  locality: string;
  involved_party: string;
  routing_type: string;
  status: string;
  assigned_volunteer_id?: string;
  assigned_volunteer_handle?: string;
  created_at: string;
  expires_at: string;
}

export interface IncidentTicketCreateDto {
  demographic: string;
  locality: string;
  involved_party: string;
  routing_type: 'specific' | 'random';
  selected_volunteer_id?: string;
}

/**
 * Fetches the full profile of a volunteer by their ID.
 */
export async function getVolunteerProfile(volunteerId: string): Promise<VolunteerResponseDto> {
  const response = await fetch(`${API_BASE_URL}/volunteers/${volunteerId}`);
  return handleApiResponse(response);
}

/**
 * Fetches all verified volunteers.
 */
export async function getVolunteers(): Promise<VolunteerResponseDto[]> {
  const response = await fetch(`${API_BASE_URL}/volunteers`);
  return handleApiResponse(response);
}

/**
 * Creates a new incident report.
 */
export async function createIncidentReport(data: IncidentTicketCreateDto): Promise<IncidentTicketResponseDto> {
  const response = await fetch(`${API_BASE_URL}/incidents`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return handleApiResponse(response);
}

/**
 * Fetches all tickets specifically assigned for the volunteer.
 * @param token The authentication token for the request.
 */
export async function getRequestedIncidents(token: string): Promise<IncidentTicketResponseDto[]> {
  const response = await fetch(`${API_BASE_URL}/incidents/requested`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return handleApiResponse(response);
}

/**
 * Fetches all cases that are in the open cases pool.
 */
export async function getPendingIncidents(token: string): Promise<IncidentTicketResponseDto[]> {
  const response = await fetch(`${API_BASE_URL}/incidents/pending`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return handleApiResponse(response);
}

/**
 * Fetches a specific incident ticket by its public_case_id.
 */
export async function getSpecificIncident(publicCaseId: string): Promise<IncidentTicketResponseDto> {
  const response = await fetch(`${API_BASE_URL}/incidents/${publicCaseId}`);
  return handleApiResponse(response);
}

/**
 * Claims an incident ticket for the authenticated volunteer.
 * @param publicCaseId The unique Case ID to claim.
 * @param token The authentication token for the request.
 */
export async function claimIncident(publicCaseId: string, token: string): Promise<IncidentTicketResponseDto> {
  const response = await fetch(`${API_BASE_URL}/incidents/${publicCaseId}/claim`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return handleApiResponse(response);
}

export interface VolunteerUpdateDto {
  first_name?: string;
  last_name?: string;
  public_alias?: string;
  external_handle?: string;
  profile_image_key?: string;
}

/**
 * Updates a volunteer's information.
 */
export async function updateVolunteer(volunteerId: string, data: VolunteerUpdateDto, token: string): Promise<VolunteerResponseDto> {
  const response = await fetch(`${API_BASE_URL}/volunteers/${volunteerId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  return handleApiResponse(response);
}

/**
 * Provides a PUT presigned URL for S3 image upload.
 */
export async function getProfileImageUploadUrl(): Promise<{ upload_url: string; key: string }> {
  const response = await fetch(`${API_BASE_URL}/volunteers/profile-image-upload-url`);
  return handleApiResponse(response);
}
