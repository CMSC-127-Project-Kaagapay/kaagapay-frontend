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
