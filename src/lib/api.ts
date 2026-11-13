// src/lib/api.ts

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8001";

export interface ApplicationForm {
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

export interface VolunteerApplicationResponseDto {
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
  | "in_progress"
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
  email: string;
  public_alias: string;
  external_handle: string;
  status: string;
  incentive_points: number;
  office_id: string | null;
  profile_image_url: string | null;
}

/** An API error that may carry per-field messages (the API can return these on 422). */
export class ApiError extends Error {
  fields: Record<string, string>;
  status: number;

  constructor(message: string, status: number, fields: Record<string, string> = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fields = fields;
  }
}

// Function to handle API responses and throw errors for non-OK status
async function handleApiResponse(response: Response) {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const detail = errorData.detail;
    if (detail && typeof detail === "object" && !Array.isArray(detail)) {
      // {field: message} from the API
      throw new ApiError("Check the highlighted fields.", response.status, detail);
    }
    if (Array.isArray(detail)) {
      // FastAPI's own validation errors
      throw new ApiError(detail.map((d: any) => d.msg).join(" "), response.status);
    }
    throw new ApiError(detail || `API request failed with status ${response.status}`, response.status);
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
 * Fetches all volunteers.
 * @returns A promise that resolves with an array of volunteer records.
 */
export async function getAllVolunteers(): Promise<VolunteerPublicRecord[]> {
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

export interface DeletedTicketResponseDto extends IncidentTicketResponseDto {
  deleted_at: string;
  deleted_by?: string;
  deleted_reason?: string;
  /** When it is removed for good, unless restored first. */
  purge_at?: string;
}

export type AdminTicketStatus = "pending" | "requested" | "claimed" | "in_progress" | "resolved" | "closed";

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
 * Fetches a volunteer by ID.
 * @param id The ID of the volunteer.
 * @returns A promise that resolves with the volunteer record.
 */
export async function getVolunteerById(
  id: string,
): Promise<VolunteerPublicRecord> {
  const response = await fetch(`${API_BASE_URL}/volunteers/${id}`, {
    headers: {
      "Content-Type": "application/json",
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

export interface AdminTicketFilters {
  volunteerId?: string;
  dateFrom?: string; // YYYY-MM-DD, inclusive
  dateTo?: string; // YYYY-MM-DD, inclusive
  page?: number;
  pageSize?: number;
}

export interface TicketPage {
  items: IncidentTicketResponseDto[];
  total: number;
  page: number;
  page_size: number;
}

/**
 * Fetches one page of incident tickets for admins, filtered by status and optional filters.
 */
export async function getAdminTicketsByStatus(
  ticketStatus: AdminTicketStatus,
  token: string,
  filters: AdminTicketFilters = {},
): Promise<TicketPage> {
  const params = new URLSearchParams();
  if (filters.volunteerId) params.set("volunteer_id", filters.volunteerId);
  if (filters.dateFrom) params.set("date_from", filters.dateFrom);
  if (filters.dateTo) params.set("date_to", filters.dateTo);
  if (filters.page) params.set("page", String(filters.page));
  if (filters.pageSize) params.set("page_size", String(filters.pageSize));
  const query = params.toString();
  const response = await fetch(`${API_BASE_URL}/admin/tickets/${ticketStatus}${query ? `?${query}` : ""}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return handleApiResponse(response);
}

/**
 * Soft-deletes a ticket. It is hidden everywhere and can be restored.
 */
export async function deleteAdminTicket(
  publicCaseId: string,
  token: string,
  reason?: string,
): Promise<DeletedTicketResponseDto> {
  const response = await fetch(`${API_BASE_URL}/admin/tickets/${encodeURIComponent(publicCaseId)}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ reason: reason?.trim() || null }),
  });
  return handleApiResponse(response);
}

/**
 * Fetches soft-deleted tickets, newest deletion first.
 */
export async function getDeletedAdminTickets(token: string): Promise<DeletedTicketResponseDto[]> {
  const response = await fetch(`${API_BASE_URL}/admin/tickets/deleted`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return handleApiResponse(response);
}

/**
 * Restores a soft-deleted ticket.
 */
export async function restoreAdminTicket(
  publicCaseId: string,
  token: string,
): Promise<IncidentTicketResponseDto> {
  const response = await fetch(`${API_BASE_URL}/admin/tickets/${encodeURIComponent(publicCaseId)}/restore`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
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
 * Updates a volunteer's information (PATCH).
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
 * Updates an existing volunteer (PUT).
 * @param id The ID of the volunteer to update.
 * @param volunteer The volunteer data to update.
 * @returns A promise that resolves with the updated volunteer record.
 */
export async function updateVolunteerById(
  id: string,
  volunteer: Partial<VolunteerPublicRecord>,
): Promise<VolunteerPublicRecord> {
  const response = await fetch(`${API_BASE_URL}/volunteers/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(volunteer),
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


// --- Admin session check ---

export interface AdminMe {
  id: string;
  first_name: string;
  last_name: string;
  role: string | null;
}

/** Asks the API whether the signed-in user is an admin. 401 = not signed in, 403 = signed in but not an admin. */
export async function getAdminMe(token: string): Promise<AdminMe> {
  const response = await fetch(`${API_BASE_URL}/admin/me`, { headers: { Authorization: `Bearer ${token}` } });
  return handleApiResponse(response);
}

export interface MonthlyTrendItem {
  label: string;
  year: number;
  month: number;
  count: number;
}

export interface QuarterlyTrendItem {
  label: string;
  year: number;
  quarter: number;
  count: number;
}

export interface AdminStats {
  active_reports: number;
  pending_reports: number;
  claimed_reports: number;
  in_progress_reports: number;
  total_tickets: number;
  resolved_tickets: number;
  resolution_rate: number;
  pending_applications: number;
  active_volunteers: number;
  incident_trends: {
    monthly: MonthlyTrendItem[];
    quarterly: QuarterlyTrendItem[];
  };
}

export async function getAdminStats(token: string): Promise<AdminStats> {
  const response = await fetch(`${API_BASE_URL}/admin/stats`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleApiResponse(response);
}

/** Fetches all volunteers (including revoked) for the admin dashboard. */
export async function getAdminVolunteers(token: string, includeRevoked = true): Promise<VolunteerResponseDto[]> {
  const response = await fetch(`${API_BASE_URL}/admin/volunteers?include_revoked=${includeRevoked}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleApiResponse(response);
}

async function patchAdminVolunteerStatus(
  volunteerId: string,
  action: 'revoke' | 'restore',
  token: string,
): Promise<VolunteerResponseDto> {
  const response = await fetch(`${API_BASE_URL}/admin/volunteers/${volunteerId}/${action}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleApiResponse(response);
}

/** Soft-revokes a volunteer so they are hidden from public and report lists. */
export function revokeVolunteer(volunteerId: string, token: string): Promise<VolunteerResponseDto> {
  return patchAdminVolunteerStatus(volunteerId, 'revoke', token);
}

/** Restores a previously revoked volunteer back to active status. */
export function restoreVolunteer(volunteerId: string, token: string): Promise<VolunteerResponseDto> {
  return patchAdminVolunteerStatus(volunteerId, 'restore', token);
}
