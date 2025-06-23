
export interface Database {
  public: {
    Tables: {
      menu_items: {
        Row: {
          id: string;
          name: string;
          description: string;
          price: string;
          image_url: string;
          category: string;
          created_at: string;
          updated_at: string;
          featured: boolean;
        };
        Insert: {
          id?: string;
          name: string;
          description: string;
          price: string;
          image_url: string;
          category: string;
          created_at?: string;
          updated_at?: string;
          featured?: boolean;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          price?: string;
          image_url?: string;
          category?: string;
          created_at?: string;
          updated_at?: string;
          featured?: boolean;
        };
      };
      site_content: {
        Row: {
          id: string;
          type: string;
          title: string;
          content: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          type: string;
          title: string;
          content: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          type?: string;
          title?: string;
          content?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}

export type MenuItem = Database['public']['Tables']['menu_items']['Row'];
export type MenuItemInsert = Database['public']['Tables']['menu_items']['Insert'];
export type MenuItemUpdate = Database['public']['Tables']['menu_items']['Update'];

export type SiteContent = Database['public']['Tables']['site_content']['Row'];
export type SiteContentInsert = Database['public']['Tables']['site_content']['Insert'];
export type SiteContentUpdate = Database['public']['Tables']['site_content']['Update'];
