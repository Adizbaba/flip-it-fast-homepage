export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      admin_logs: {
        Row: {
          action: string
          admin_id: string | null
          created_at: string
          details: Json | null
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: string | null
        }
        Insert: {
          action: string
          admin_id?: string | null
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: string | null
        }
        Update: {
          action?: string
          admin_id?: string | null
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_logs_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_users: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          last_login: string | null
          role: Database["public"]["Enums"]["admin_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          last_login?: string | null
          role?: Database["public"]["Enums"]["admin_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          last_login?: string | null
          role?: Database["public"]["Enums"]["admin_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      auction_events: {
        Row: {
          auction_item_id: string
          created_at: string
          event_data: Json | null
          event_type: string
          id: string
          user_id: string | null
        }
        Insert: {
          auction_item_id: string
          created_at?: string
          event_data?: Json | null
          event_type: string
          id?: string
          user_id?: string | null
        }
        Update: {
          auction_item_id?: string
          created_at?: string
          event_data?: Json | null
          event_type?: string
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "auction_events_auction_item_id_fkey"
            columns: ["auction_item_id"]
            isOneToOne: false
            referencedRelation: "auction_items"
            referencedColumns: ["id"]
          },
        ]
      }
      auction_items: {
        Row: {
          auction_type: string
          bid_count: number | null
          bid_increment: number
          buy_now_price: number | null
          category_id: string
          condition: string
          created_at: string
          current_bid: number | null
          description: string
          edit_count: number | null
          end_date: string
          ended_at: string | null
          final_selling_price: number | null
          highest_bidder_id: string | null
          id: string
          images: Json | null
          quantity: number
          reserve_met: boolean | null
          reserve_price: number | null
          return_policy: string | null
          seller_id: string
          shipping_options: Json | null
          start_date: string
          starting_bid: number
          status: string
          title: string
          updated_at: string
          variations: Json | null
          winner_id: string | null
        }
        Insert: {
          auction_type: string
          bid_count?: number | null
          bid_increment?: number
          buy_now_price?: number | null
          category_id: string
          condition: string
          created_at?: string
          current_bid?: number | null
          description: string
          edit_count?: number | null
          end_date: string
          ended_at?: string | null
          final_selling_price?: number | null
          highest_bidder_id?: string | null
          id?: string
          images?: Json | null
          quantity?: number
          reserve_met?: boolean | null
          reserve_price?: number | null
          return_policy?: string | null
          seller_id: string
          shipping_options?: Json | null
          start_date: string
          starting_bid: number
          status?: string
          title: string
          updated_at?: string
          variations?: Json | null
          winner_id?: string | null
        }
        Update: {
          auction_type?: string
          bid_count?: number | null
          bid_increment?: number
          buy_now_price?: number | null
          category_id?: string
          condition?: string
          created_at?: string
          current_bid?: number | null
          description?: string
          edit_count?: number | null
          end_date?: string
          ended_at?: string | null
          final_selling_price?: number | null
          highest_bidder_id?: string | null
          id?: string
          images?: Json | null
          quantity?: number
          reserve_met?: boolean | null
          reserve_price?: number | null
          return_policy?: string | null
          seller_id?: string
          shipping_options?: Json | null
          start_date?: string
          starting_bid?: number
          status?: string
          title?: string
          updated_at?: string
          variations?: Json | null
          winner_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "auction_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_auction_items_seller_id"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_auction_items_seller_id"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles_secure"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_auction_items_seller_id"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      bids: {
        Row: {
          auction_item_id: string
          bid_amount: number
          bidder_id: string
          created_at: string
          id: string
          updated_at: string
        }
        Insert: {
          auction_item_id: string
          bid_amount: number
          bidder_id: string
          created_at?: string
          id?: string
          updated_at?: string
        }
        Update: {
          auction_item_id?: string
          bid_amount?: number
          bidder_id?: string
          created_at?: string
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_bids_auction_item_id"
            columns: ["auction_item_id"]
            isOneToOne: false
            referencedRelation: "auction_items"
            referencedColumns: ["id"]
          },
        ]
      }
      cart_items: {
        Row: {
          added_at: string
          id: string
          item_id: string
          item_type: string
          quantity: number
          user_id: string
        }
        Insert: {
          added_at?: string
          id?: string
          item_id: string
          item_type: string
          quantity?: number
          user_id: string
        }
        Update: {
          added_at?: string
          id?: string
          item_id?: string
          item_type?: string
          quantity?: number
          user_id?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      declutter_listings: {
        Row: {
          bulk_price: number
          category_id: string | null
          condition: string
          created_at: string
          description: string
          edit_count: number
          id: string
          images: Json | null
          is_negotiable: boolean | null
          location: string | null
          min_purchase_quantity: number
          original_price: number
          quantity: number
          seller_id: string
          shipping_options: Json | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          bulk_price: number
          category_id?: string | null
          condition: string
          created_at?: string
          description: string
          edit_count?: number
          id?: string
          images?: Json | null
          is_negotiable?: boolean | null
          location?: string | null
          min_purchase_quantity?: number
          original_price: number
          quantity: number
          seller_id: string
          shipping_options?: Json | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          bulk_price?: number
          category_id?: string | null
          condition?: string
          created_at?: string
          description?: string
          edit_count?: number
          id?: string
          images?: Json | null
          is_negotiable?: boolean | null
          location?: string | null
          min_purchase_quantity?: number
          original_price?: number
          quantity?: number
          seller_id?: string
          shipping_options?: Json | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "declutter_listings_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          data: Json | null
          email_sent: boolean | null
          id: string
          message: string
          read: boolean | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          email_sent?: boolean | null
          id?: string
          message: string
          read?: boolean | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          email_sent?: boolean | null
          id?: string
          message?: string
          read?: boolean | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          item_data: Json | null
          item_id: string
          item_type: string
          order_id: string
          price: number
          quantity: number
        }
        Insert: {
          created_at?: string
          id?: string
          item_data?: Json | null
          item_id: string
          item_type: string
          order_id: string
          price: number
          quantity?: number
        }
        Update: {
          created_at?: string
          id?: string
          item_data?: Json | null
          item_id?: string
          item_type?: string
          order_id?: string
          price?: number
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          id: string
          payment_details: Json | null
          payment_reference: string | null
          status: string
          total_amount: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          payment_details?: Json | null
          payment_reference?: string | null
          status?: string
          total_amount: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          payment_details?: Json | null
          payment_reference?: string | null
          status?: string
          total_amount?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      payment_transactions: {
        Row: {
          amount: number
          created_at: string
          id: string
          item_id: string | null
          metadata: Json | null
          payment_details: Json | null
          payment_provider: string
          payment_type: string
          reference: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          item_id?: string | null
          metadata?: Json | null
          payment_details?: Json | null
          payment_provider: string
          payment_type: string
          reference: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          item_id?: string | null
          metadata?: Json | null
          payment_details?: Json | null
          payment_provider?: string
          payment_type?: string
          reference?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_transactions_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "auction_items"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          contact_number: string | null
          created_at: string
          full_name: string
          id: string
          profile_visibility: string | null
          shipping_address: string | null
          updated_at: string
          username: string
        }
        Insert: {
          avatar_url?: string | null
          contact_number?: string | null
          created_at?: string
          full_name: string
          id: string
          profile_visibility?: string | null
          shipping_address?: string | null
          updated_at?: string
          username: string
        }
        Update: {
          avatar_url?: string | null
          contact_number?: string | null
          created_at?: string
          full_name?: string
          id?: string
          profile_visibility?: string | null
          shipping_address?: string | null
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
      saved_items: {
        Row: {
          created_at: string
          id: string
          item_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          item_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          item_id?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      profiles_secure: {
        Row: {
          avatar_url: string | null
          contact_number: string | null
          created_at: string | null
          full_name: string | null
          id: string | null
          profile_visibility: string | null
          shipping_address: string | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          contact_number?: never
          created_at?: string | null
          full_name?: string | null
          id?: string | null
          profile_visibility?: string | null
          shipping_address?: never
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          contact_number?: never
          created_at?: string | null
          full_name?: string | null
          id?: string | null
          profile_visibility?: string | null
          shipping_address?: never
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      public_profiles: {
        Row: {
          avatar_url: string | null
          full_name: string | null
          id: string | null
          profile_visibility: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          full_name?: string | null
          id?: string | null
          profile_visibility?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          full_name?: string | null
          id?: string | null
          profile_visibility?: string | null
          username?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      end_auction: {
        Args: { auction_id: string }
        Returns: Json
      }
      has_admin_permission: {
        Args: {
          user_id: string
          required_role: Database["public"]["Enums"]["admin_role"]
        }
        Returns: boolean
      }
      has_admin_role: {
        Args: {
          user_id: string
          required_role: Database["public"]["Enums"]["admin_role"]
        }
        Returns: boolean
      }
      is_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
      log_admin_action: {
        Args: {
          admin_id: string
          action: string
          entity_type: string
          entity_id: string
          details: Json
          ip_address?: string
        }
        Returns: string
      }
      process_expired_auctions: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
    }
    Enums: {
      admin_role:
        | "super_admin"
        | "moderator"
        | "account_manager"
        | "dispute_manager"
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
    Enums: {
      admin_role: [
        "super_admin",
        "moderator",
        "account_manager",
        "dispute_manager",
      ],
    },
  },
} as const
