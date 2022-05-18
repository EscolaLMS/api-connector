import request from "umi-request";
import * as API from "../types/api";
import { currentTimezone } from "../utils";

export async function getNotifications(
  token: string,
  options?: Record<string, any>
) {
  return request<API.DefaultResponse<API.Notification[]>>(
    `/api/notifications`,
    {
      method: "GET",
      /* useCache: true */ useCache: false,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        Current_timezone: currentTimezone(),
      },
      ...(options || {}),
    }
  );
}

export async function readNotification(
  id: string,
  token: string,
  options?: Record<string, any>
) {
  return request<API.DefaultResponse<API.Notification[]>>(
    `/api/notifications/${id}/read`,
    {
      method: "POST",
      /* useCache: true */ useCache: false,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        Current_timezone: currentTimezone(),
      },
      ...(options || {}),
    }
  );
}
