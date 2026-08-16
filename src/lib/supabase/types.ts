export type TeamRole = "coach" | "captain" | "athlete";
export type RsvpStatus = "yes" | "no" | "maybe";
export type EventType = "practice" | "game" | "meeting" | "other";
export type ProfileVisibility = "public" | "private";
export type WeightUnit = "kg" | "lb";
export type DistanceUnit = "km" | "mi";
export type TimeFormat = "12h" | "24h";
export type ReadinessLevel = "low" | "medium" | "high";
export type BiologicalSex = "male" | "female";
export type PrimaryGoal = "cut" | "maintain" | "bulk";
export type ExperienceLevel = "beginner" | "intermediate" | "advanced";
export type MuscleGroup =
  | "Chest"
  | "Back"
  | "Shoulders"
  | "Quads"
  | "Hamstrings/Glutes"
  | "Calves"
  | "Biceps"
  | "Triceps"
  | "Core"
  | "Olympic/Power"
  | "Full Body/Functional"
  | "Explosive/Plyometric";
export type SetType = "normal" | "warmup" | "failure" | "dropset";

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          created_at: string;
          sport: string | null;
          position: string | null;
          favorite_player: string | null;
          favorite_team: string | null;
          shoe_rotation: string[];
          profile_visibility: ProfileVisibility;
          units_weight: WeightUnit;
          units_distance: DistanceUnit;
          time_format: TimeFormat;
          notif_session_reminders: boolean;
          notif_badge_alerts: boolean;
          notif_missed_session: boolean;
          whoop_sync_enabled: boolean;
          whoop_burn_override: boolean;
          dietary_restriction: string | null;
          nutrition_calories: number | null;
          nutrition_protein_g: number | null;
          nutrition_carbs_g: number | null;
          nutrition_fat_g: number | null;
          nutrition_notes: string | null;
          age: number | null;
          height_cm: number | null;
          weight_kg: number | null;
          biological_sex: BiologicalSex | null;
          primary_goal: PrimaryGoal | null;
          workouts_per_week: number | null;
          onboarding_completed: boolean;
          experience_level: ExperienceLevel | null;
          equipment_access: string[];
        };
        Insert: {
          id: string;
          full_name: string;
          created_at?: string;
        };
        Update: {
          full_name?: string;
          sport?: string | null;
          position?: string | null;
          favorite_player?: string | null;
          favorite_team?: string | null;
          shoe_rotation?: string[];
          profile_visibility?: ProfileVisibility;
          units_weight?: WeightUnit;
          units_distance?: DistanceUnit;
          time_format?: TimeFormat;
          notif_session_reminders?: boolean;
          notif_badge_alerts?: boolean;
          notif_missed_session?: boolean;
          whoop_sync_enabled?: boolean;
          whoop_burn_override?: boolean;
          dietary_restriction?: string | null;
          nutrition_calories?: number | null;
          nutrition_protein_g?: number | null;
          nutrition_carbs_g?: number | null;
          nutrition_fat_g?: number | null;
          nutrition_notes?: string | null;
          age?: number | null;
          height_cm?: number | null;
          weight_kg?: number | null;
          biological_sex?: BiologicalSex | null;
          primary_goal?: PrimaryGoal | null;
          workouts_per_week?: number | null;
          onboarding_completed?: boolean;
          experience_level?: ExperienceLevel | null;
          equipment_access?: string[];
        };
        Relationships: [];
      };
      goals: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          is_completed: boolean;
          created_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          is_completed?: boolean;
          created_at?: string;
          completed_at?: string | null;
        };
        Update: {
          title?: string;
          is_completed?: boolean;
          completed_at?: string | null;
        };
        Relationships: [];
      };
      journal_entries: {
        Row: {
          id: string;
          user_id: string;
          entry_date: string;
          readiness: ReadinessLevel | null;
          content: string | null;
          good_habits: string | null;
          bad_habits: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          entry_date?: string;
          readiness?: ReadinessLevel | null;
          content?: string | null;
          good_habits?: string | null;
          bad_habits?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          readiness?: ReadinessLevel | null;
          content?: string | null;
          good_habits?: string | null;
          bad_habits?: string | null;
          updated_at?: string;
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
      exercises: {
        Row: {
          id: string;
          name: string;
          muscle_group: MuscleGroup;
          primary_muscles: string;
          secondary_muscles: string | null;
          equipment: string;
        };
        Insert: {
          id?: string;
          name: string;
          muscle_group: MuscleGroup;
          primary_muscles: string;
          secondary_muscles?: string | null;
          equipment: string;
        };
        Update: Record<string, never>;
        Relationships: [];
      };
      workout_templates: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          created_at?: string;
        };
        Update: {
          name?: string;
        };
        Relationships: [];
      };
      template_exercises: {
        Row: {
          id: string;
          template_id: string;
          exercise_id: string;
          position: number;
          superset_group: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          template_id: string;
          exercise_id: string;
          position?: number;
          superset_group?: number | null;
          created_at?: string;
        };
        Update: {
          position?: number;
          superset_group?: number | null;
        };
        Relationships: [];
      };
      workout_sessions: {
        Row: {
          id: string;
          user_id: string;
          template_id: string | null;
          started_at: string;
          ended_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          template_id?: string | null;
          started_at?: string;
          ended_at?: string | null;
          created_at?: string;
        };
        Update: {
          ended_at?: string | null;
        };
        Relationships: [];
      };
      session_exercises: {
        Row: {
          id: string;
          session_id: string;
          exercise_id: string;
          position: number;
          superset_group: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          exercise_id: string;
          position?: number;
          superset_group?: number | null;
          created_at?: string;
        };
        Update: {
          position?: number;
          superset_group?: number | null;
        };
        Relationships: [];
      };
      session_sets: {
        Row: {
          id: string;
          session_exercise_id: string;
          set_number: number;
          weight: number | null;
          reps: number | null;
          set_type: SetType;
          is_confirmed: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_exercise_id: string;
          set_number: number;
          weight?: number | null;
          reps?: number | null;
          set_type?: SetType;
          is_confirmed?: boolean;
          created_at?: string;
        };
        Update: {
          weight?: number | null;
          reps?: number | null;
          set_type?: SetType;
          is_confirmed?: boolean;
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
