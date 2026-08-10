export type TeamRole = "coach" | "captain" | "athlete";
export type RsvpStatus = "yes" | "no" | "maybe";
export type EventType = "practice" | "game" | "meeting" | "other";

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          created_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          created_at?: string;
        };
        Update: {
          full_name?: string;
        };
        Relationships: [];
      };
      teams: {
        Row: {
          id: string;
          name: string;
          sport: string | null;
          invite_code: string;
          created_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          sport?: string | null;
          invite_code?: string;
          created_by: string;
          created_at?: string;
        };
        Update: {
          name?: string;
          sport?: string | null;
        };
        Relationships: [];
      };
      team_members: {
        Row: {
          id: string;
          team_id: string;
          user_id: string;
          role: TeamRole;
          created_at: string;
        };
        Insert: {
          id?: string;
          team_id: string;
          user_id: string;
          role?: TeamRole;
          created_at?: string;
        };
        Update: {
          role?: TeamRole;
        };
        Relationships: [];
      };
      events: {
        Row: {
          id: string;
          team_id: string;
          title: string;
          type: EventType;
          location: string | null;
          starts_at: string;
          ends_at: string | null;
          notes: string | null;
          created_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          team_id: string;
          title: string;
          type?: EventType;
          location?: string | null;
          starts_at: string;
          ends_at?: string | null;
          notes?: string | null;
          created_by: string;
          created_at?: string;
        };
        Update: {
          title?: string;
          type?: EventType;
          location?: string | null;
          starts_at?: string;
          ends_at?: string | null;
          notes?: string | null;
        };
        Relationships: [];
      };
      event_rsvps: {
        Row: {
          id: string;
          event_id: string;
          user_id: string;
          status: RsvpStatus;
          created_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          user_id: string;
          status: RsvpStatus;
          created_at?: string;
        };
        Update: {
          status?: RsvpStatus;
        };
        Relationships: [];
      };
      workouts: {
        Row: {
          id: string;
          team_id: string;
          title: string;
          description: string | null;
          created_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          team_id: string;
          title: string;
          description?: string | null;
          created_by: string;
          created_at?: string;
        };
        Update: {
          title?: string;
          description?: string | null;
        };
        Relationships: [];
      };
      workout_logs: {
        Row: {
          id: string;
          user_id: string;
          workout_id: string | null;
          team_id: string;
          title: string;
          notes: string | null;
          duration_minutes: number | null;
          performed_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          workout_id?: string | null;
          team_id: string;
          title: string;
          notes?: string | null;
          duration_minutes?: number | null;
          performed_at?: string;
          created_at?: string;
        };
        Update: {
          title?: string;
          notes?: string | null;
          duration_minutes?: number | null;
          performed_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      join_team_by_code: {
        Args: { p_invite_code: string };
        Returns: string;
      };
      is_team_member: {
        Args: { p_team_id: string };
        Returns: boolean;
      };
      is_team_leader: {
        Args: { p_team_id: string };
        Returns: boolean;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
