export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
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
      auction_items: {
        Row: {
          auction_type: string
          bid_increment: number
          buy_now_price: number | null
          category_id: string
          condition: string
          created_at: string
          description: string
          edit_count: number | null
          end_date: string
          id: string
          images: Json | null
          quantity: number
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
        }
        Insert: {
          auction_type: string
          bid_increment?: number
          buy_now_price?: number | null
          category_id: string
          condition: string
          created_at?: string
          description: string
          edit_count?: number | null
          end_date: string
          id?: string
          images?: Json | null
          quantity?: number
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
        }
        Update: {
          auction_type?: string
          bid_increment?: number
          buy_now_price?: number | null
          category_id?: string
          condition?: string
          created_at?: string
          description?: string
          edit_count?: number | null
          end_date?: string
          id?: string
          images?: Json | null
          quantity?: number
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
      [_ in never]: never
    }
    Functions: {
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
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
