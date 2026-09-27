import apiClient from "../../../api/apiClient";

/** Shape of `GET /auth/me/` (`accounts.views.MeView`). */
export interface CurrentUserApi {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  profile_picture: string | null;
  role: "buyer" | "farmer" | "admin";
  is_active: boolean;
  created_at: string;
}

export async function getCurrentUser(): Promise<CurrentUserApi> {
  const response = await apiClient.get<CurrentUserApi>("/auth/me/");
  return response.data;
}

export type RegisterRole = "buyer" | "farmer";

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role: RegisterRole;
}

/**
 * Response of `POST /auth/register/` (`accounts.views.RegisterView`): the
 * freshly created account plus a token pair, so the caller can sign the new
 * user in without a second round trip.
 */
export interface RegisterResponse {
  user: CurrentUserApi;
  access: string;
  refresh: string;
}

/**
 * Creates an account. The server only accepts the buyer and farmer roles —
 * admin accounts are created out-of-band — and rejects a duplicate email, so
 * callers should surface those field-level errors back onto the form.
 */
export async function register(
  payload: RegisterPayload,
): Promise<RegisterResponse> {
  const response = await apiClient.post<RegisterResponse>(
    "/auth/register/",
    payload,
  );
  return response.data;
}
