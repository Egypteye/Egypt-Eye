export type DiscountCampaign = {
  id: string;
  name: string;
  slug: string;
  discount_type: "percentage" | "fixed";
  value: number;
  max_discount_amount: number | null;
  min_booking_value: number | null;
  one_time_use: boolean;
  new_customers_only: boolean;
  eligible_tour_slugs: string[] | null;
  excluded_tour_slugs: string[] | null;
  eligible_experience_slugs: string[] | null;
  excluded_experience_slugs: string[] | null;
  active: boolean;
  starts_at: string;
  ends_at: string | null;
  code_validity_days: number | null;
};

export type DiscountCodeRow = {
  id: string;
  code: string;
  campaign_id: string;
  customer_id: string | null;
  subscriber_id: string | null;
  status: "available" | "redeemed" | "expired" | "revoked";
  expires_at: string | null;
  created_at: string;
};
