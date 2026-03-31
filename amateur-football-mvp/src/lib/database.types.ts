export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      canchas_bookings: {
        Row: {
          booker_id: string | null
          created_at: string | null
          date: string
          down_payment_paid: number
          end_time: string
          field_id: string
          id: string
          match_id: string | null
          start_time: string
          status: string
          title: string | null
          total_price: number
          updated_at: string | null
        }
        Insert: {
          booker_id?: string | null
          created_at?: string | null
          date: string
          down_payment_paid?: number
          end_time: string
          field_id: string
          id?: string
          match_id?: string | null
          start_time: string
          status?: string
          title?: string | null
          total_price?: number
          updated_at?: string | null
        }
        Update: {
          booker_id?: string | null
          created_at?: string | null
          date?: string
          down_payment_paid?: number
          end_time?: string
          field_id?: string
          id?: string
          match_id?: string | null
          start_time?: string
          status?: string
          title?: string | null
          total_price?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "canchas_bookings_field_id_fkey"
            columns: ["field_id"]
            isOneToOne: false
            referencedRelation: "canchas_fields"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "canchas_bookings_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
      canchas_businesses: {
        Row: {
          address: string | null
          alias_cbu: string | null
          amenities: string[] | null
          city: string | null
          created_at: string | null
          description: string | null
          google_maps_link: string | null
          id: string
          is_active: boolean | null
          mp_access_token: string | null
          mp_public_key: string | null
          name: string
          owner_id: string
          phone: string | null
          profile_image_url: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          alias_cbu?: string | null
          amenities?: string[] | null
          city?: string | null
          created_at?: string | null
          description?: string | null
          google_maps_link?: string | null
          id?: string
          is_active?: boolean | null
          mp_access_token?: string | null
          mp_public_key?: string | null
          name: string
          owner_id: string
          phone?: string | null
          profile_image_url?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          alias_cbu?: string | null
          amenities?: string[] | null
          city?: string | null
          created_at?: string | null
          description?: string | null
          google_maps_link?: string | null
          id?: string
          is_active?: boolean | null
          mp_access_token?: string | null
          mp_public_key?: string | null
          name?: string
          owner_id?: string
          phone?: string | null
          profile_image_url?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      canchas_fields: {
        Row: {
          business_id: string
          created_at: string | null
          down_payment_percentage: number
          id: string
          is_active: boolean | null
          name: string
          price_per_match: number
          type: string
        }
        Insert: {
          business_id: string
          created_at?: string | null
          down_payment_percentage?: number
          id?: string
          is_active?: boolean | null
          name: string
          price_per_match?: number
          type: string
        }
        Update: {
          business_id?: string
          created_at?: string | null
          down_payment_percentage?: number
          id?: string
          is_active?: boolean | null
          name?: string
          price_per_match?: number
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "canchas_fields_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "canchas_businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      direct_messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          is_read: boolean | null
          recipient_id: string
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          recipient_id: string
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          recipient_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "direct_messages_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "direct_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      friendships: {
        Row: {
          created_at: string
          friend_id: string | null
          id: string
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          friend_id?: string | null
          id?: string
          status: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          friend_id?: string | null
          id?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      match_highlight_comments: {
        Row: {
          content: string
          created_at: string | null
          highlight_id: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          highlight_id?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          highlight_id?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "match_highlight_comments_highlight_id_fkey"
            columns: ["highlight_id"]
            isOneToOne: false
            referencedRelation: "match_highlights"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_highlight_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      match_highlight_likes: {
        Row: {
          created_at: string | null
          highlight_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          highlight_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          highlight_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "match_highlight_likes_highlight_id_fkey"
            columns: ["highlight_id"]
            isOneToOne: false
            referencedRelation: "match_highlights"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_highlight_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      match_highlights: {
        Row: {
          comments_count: number | null
          created_at: string | null
          description: string | null
          id: string
          likes_count: number | null
          match_id: string | null
          thumbnail_url: string | null
          user_id: string
          video_url: string
          views_count: number | null
        }
        Insert: {
          comments_count?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          likes_count?: number | null
          match_id?: string | null
          thumbnail_url?: string | null
          user_id: string
          video_url: string
          views_count?: number | null
        }
        Update: {
          comments_count?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          likes_count?: number | null
          match_id?: string | null
          thumbnail_url?: string | null
          user_id?: string
          video_url?: string
          views_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "match_highlights_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_highlights_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      match_messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          match_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          match_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          match_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "match_messages_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      match_participants: {
        Row: {
          created_at: string | null
          id: string
          match_id: string | null
          paid: boolean | null
          stats_applied: boolean | null
          status: string | null
          team: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          match_id?: string | null
          paid?: boolean | null
          stats_applied?: boolean | null
          status?: string | null
          team?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          match_id?: string | null
          paid?: boolean | null
          stats_applied?: boolean | null
          status?: string | null
          team?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "match_participants_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
      match_reports: {
        Row: {
          created_at: string | null
          id: string
          match_id: string | null
          personal_goals: number
          reporter_id: string | null
          team: string
          team_a_score: number
          team_b_score: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          match_id?: string | null
          personal_goals?: number
          reporter_id?: string | null
          team: string
          team_a_score?: number
          team_b_score?: number
        }
        Update: {
          created_at?: string | null
          id?: string
          match_id?: string | null
          personal_goals?: number
          reporter_id?: string | null
          team?: string
          team_a_score?: number
          team_b_score?: number
        }
        Relationships: [
          {
            foreignKeyName: "match_reports_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      matches: {
        Row: {
          business_id: string | null
          created_at: string | null
          creator_id: string | null
          date: string
          field_id: string | null
          goal_scorers: Json | null
          id: string
          is_completed: boolean | null
          is_private: boolean | null
          is_recruitment: boolean | null
          level: string | null
          location: string
          missing_players: number | null
          payment_method: string | null
          price: number | null
          sportsreel_url: string | null
          status: string | null
          team_a_id: string | null
          team_a_name: string | null
          team_a_score: number | null
          team_b_id: string | null
          team_b_name: string | null
          team_b_score: number | null
          time: string
          type: string | null
        }
        Insert: {
          business_id?: string | null
          created_at?: string | null
          creator_id?: string | null
          date: string
          field_id?: string | null
          goal_scorers?: Json | null
          id?: string
          is_completed?: boolean | null
          is_private?: boolean | null
          is_recruitment?: boolean | null
          level?: string | null
          location: string
          missing_players?: number | null
          payment_method?: string | null
          price?: number | null
          sportsreel_url?: string | null
          status?: string | null
          team_a_id?: string | null
          team_a_name?: string | null
          team_a_score?: number | null
          team_b_id?: string | null
          team_b_name?: string | null
          team_b_score?: number | null
          time: string
          type?: string | null
        }
        Update: {
          business_id?: string | null
          created_at?: string | null
          creator_id?: string | null
          date?: string
          field_id?: string | null
          goal_scorers?: Json | null
          id?: string
          is_completed?: boolean | null
          is_private?: boolean | null
          is_recruitment?: boolean | null
          level?: string | null
          location?: string
          missing_players?: number | null
          payment_method?: string | null
          price?: number | null
          sportsreel_url?: string | null
          status?: string | null
          team_a_id?: string | null
          team_a_name?: string | null
          team_a_score?: number | null
          team_b_id?: string | null
          team_b_name?: string | null
          team_b_score?: number | null
          time?: string
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "matches_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "canchas_businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_field_id_fkey"
            columns: ["field_id"]
            isOneToOne: false
            referencedRelation: "canchas_fields"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_team_a_id_fkey"
            columns: ["team_a_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_team_b_id_fkey"
            columns: ["team_b_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      mvp_votes: {
        Row: {
          created_at: string | null
          id: string
          match_id: string
          voted_player_id: string
          voter_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          match_id: string
          voted_player_id: string
          voter_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          match_id?: string
          voted_player_id?: string
          voter_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mvp_votes_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mvp_votes_voted_player_id_fkey"
            columns: ["voted_player_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mvp_votes_voter_id_fkey"
            columns: ["voter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      player_ratings: {
        Row: {
          created_at: string | null
          from_user_id: string
          id: string
          match_id: string | null
          rating: number
          to_user_id: string
        }
        Insert: {
          created_at?: string | null
          from_user_id: string
          id?: string
          match_id?: string | null
          rating: number
          to_user_id: string
        }
        Update: {
          created_at?: string | null
          from_user_id?: string
          id?: string
          match_id?: string | null
          rating?: number
          to_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "player_ratings_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_comments: {
        Row: {
          author_id: string
          content: string
          created_at: string | null
          id: string
          profile_id: string
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string | null
          id?: string
          profile_id: string
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string | null
          id?: string
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_comments_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_comments_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          age: number | null
          avatar_url: string | null
          bio: string | null
          cover_url: string | null
          elo: number | null
          goals: number | null
          height: number | null
          id: string
          matches: number | null
          matches_won: number | null
          mp_access_token: string | null
          mp_public_key: string | null
          mp_refresh_token: string | null
          mp_user_id: string | null
          mvp_count: number | null
          name: string | null
          position: string | null
          preferred_foot: string | null
          role: string | null
          skill_points: number | null
          stats: Json | null
          updated_at: string | null
        }
        Insert: {
          age?: number | null
          avatar_url?: string | null
          bio?: string | null
          cover_url?: string | null
          elo?: number | null
          goals?: number | null
          height?: number | null
          id: string
          matches?: number | null
          matches_won?: number | null
          mp_access_token?: string | null
          mp_public_key?: string | null
          mp_refresh_token?: string | null
          mp_user_id?: string | null
          mvp_count?: number | null
          name?: string | null
          position?: string | null
          preferred_foot?: string | null
          role?: string | null
          skill_points?: number | null
          stats?: Json | null
          updated_at?: string | null
        }
        Update: {
          age?: number | null
          avatar_url?: string | null
          bio?: string | null
          cover_url?: string | null
          elo?: number | null
          goals?: number | null
          height?: number | null
          id?: string
          matches?: number | null
          matches_won?: number | null
          mp_access_token?: string | null
          mp_public_key?: string | null
          mp_refresh_token?: string | null
          mp_user_id?: string | null
          mvp_count?: number | null
          name?: string | null
          position?: string | null
          preferred_foot?: string | null
          role?: string | null
          skill_points?: number | null
          stats?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      team_challenges: {
        Row: {
          challenged_team_id: string
          challenger_team_id: string
          created_at: string | null
          id: string
          location: string
          match_date: string
          match_time: string
          message: string | null
          price: number | null
          status: string
          venue_candidates: Json | null
          votes: Json | null
        }
        Insert: {
          challenged_team_id: string
          challenger_team_id: string
          created_at?: string | null
          id?: string
          location: string
          match_date: string
          match_time: string
          message?: string | null
          price?: number | null
          status?: string
          venue_candidates?: Json | null
          votes?: Json | null
        }
        Update: {
          challenged_team_id?: string
          challenger_team_id?: string
          created_at?: string | null
          id?: string
          location?: string
          match_date?: string
          match_time?: string
          message?: string | null
          price?: number | null
          status?: string
          venue_candidates?: Json | null
          votes?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "team_challenges_challenged_team_id_fkey"
            columns: ["challenged_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_challenges_challenger_team_id_fkey"
            columns: ["challenger_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_formations: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          layout: Json
          name: string
          team_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          layout: Json
          name: string
          team_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          layout?: Json
          name?: string
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_formations_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          created_at: string | null
          id: string
          profile_id: string | null
          role: string | null
          status: string | null
          team_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          profile_id?: string | null
          role?: string | null
          status?: string | null
          team_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          profile_id?: string | null
          role?: string | null
          status?: string | null
          team_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_members_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          team_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          team_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          team_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_messages_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      team_trophies: {
        Row: {
          achievement_type: string
          awarded_at: string | null
          description: string | null
          id: string
          match_id: string | null
          team_id: string
          title: string
        }
        Insert: {
          achievement_type: string
          awarded_at?: string | null
          description?: string | null
          id?: string
          match_id?: string | null
          team_id: string
          title: string
        }
        Update: {
          achievement_type?: string
          awarded_at?: string | null
          description?: string | null
          id?: string
          match_id?: string | null
          team_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_trophies_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_trophies_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          captain_id: string | null
          created_at: string | null
          description: string | null
          draws: number | null
          elo: number | null
          founded_date: string | null
          goals_against: number | null
          goals_for: number | null
          id: string
          jersey_pattern: string | null
          level: number | null
          logo_url: string | null
          losses: number | null
          max_members: number | null
          members_count: number | null
          motto: string | null
          name: string
          primary_color: string | null
          secondary_color: string | null
          wins: number | null
          xp: number | null
        }
        Insert: {
          captain_id?: string | null
          created_at?: string | null
          description?: string | null
          draws?: number | null
          elo?: number | null
          founded_date?: string | null
          goals_against?: number | null
          goals_for?: number | null
          id?: string
          jersey_pattern?: string | null
          level?: number | null
          logo_url?: string | null
          losses?: number | null
          max_members?: number | null
          members_count?: number | null
          motto?: string | null
          name: string
          primary_color?: string | null
          secondary_color?: string | null
          wins?: number | null
          xp?: number | null
        }
        Update: {
          captain_id?: string | null
          created_at?: string | null
          description?: string | null
          draws?: number | null
          elo?: number | null
          founded_date?: string | null
          goals_against?: number | null
          goals_for?: number | null
          id?: string
          jersey_pattern?: string | null
          level?: number | null
          logo_url?: string | null
          losses?: number | null
          max_members?: number | null
          members_count?: number | null
          motto?: string | null
          name?: string
          primary_color?: string | null
          secondary_color?: string | null
          wins?: number | null
          xp?: number | null
        }
        Relationships: []
      }
      user_badges: {
        Row: {
          awarded_at: string | null
          badge_type: string
          id: string
          match_id: string | null
          user_id: string
        }
        Insert: {
          awarded_at?: string | null
          badge_type: string
          id?: string
          match_id?: string | null
          user_id: string
        }
        Update: {
          awarded_at?: string | null
          badge_type?: string
          id?: string
          match_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_badges_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      team_h2h_view: {
        Row: {
          draws: number | null
          team_1_id: string | null
          team_1_wins: number | null
          team_2_id: string | null
          team_2_wins: number | null
          total_matches: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      award_match_badges: {
        Args: { p_goals: number; p_match_id: string; p_user_id: string }
        Returns: undefined
      }
      delete_my_account: { Args: never; Returns: undefined }
      finalize_match_and_sync_stats: {
        Args: { p_match_id: string }
        Returns: undefined
      }
      increment_highlight_views: { Args: { h_id: string }; Returns: undefined }
      submit_full_match_report: {
        Args: {
          p_match_id: string
          p_mvp_id: string
          p_personal_goals: number
          p_ratings: Json
          p_team: string
          p_team_a_score: number
          p_team_b_score: number
          p_user_id: string
        }
        Returns: Json
      }
      update_team_stats_on_match_result: {
        Args: { p_match_id: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
