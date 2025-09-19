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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      accounts: {
        Row: {
          balance: number | null
          created_at: string
          credit_limit: number | null
          due_date: string | null
          due_day: number | null
          id: string
          name: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number | null
          created_at?: string
          credit_limit?: number | null
          due_date?: string | null
          due_day?: number | null
          id?: string
          name: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number | null
          created_at?: string
          credit_limit?: number | null
          due_date?: string | null
          due_day?: number | null
          id?: string
          name?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      business_unit_agents: {
        Row: {
          bu_id: string
          created_at: string
          description: string | null
          id: string
          name: string
          webhook_url: string
        }
        Insert: {
          bu_id: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
          webhook_url: string
        }
        Update: {
          bu_id?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          webhook_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_unit_agents_bu_id_fkey"
            columns: ["bu_id"]
            isOneToOne: false
            referencedRelation: "business_units"
            referencedColumns: ["id"]
          },
        ]
      }
      business_units: {
        Row: {
          category: string | null
          color_class: string | null
          created_at: string
          description: string | null
          icon_url: string | null
          id: string
          name: string
        }
        Insert: {
          category?: string | null
          color_class?: string | null
          created_at?: string
          description?: string | null
          icon_url?: string | null
          id: string
          name: string
        }
        Update: {
          category?: string | null
          color_class?: string | null
          created_at?: string
          description?: string | null
          icon_url?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          color: string | null
          created_at: string
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      course_progress: {
        Row: {
          completed_at: string
          created_at: string
          id: string
          module_id: string
          user_id: string
        }
        Insert: {
          completed_at?: string
          created_at?: string
          id?: string
          module_id: string
          user_id: string
        }
        Update: {
          completed_at?: string
          created_at?: string
          id?: string
          module_id?: string
          user_id?: string
        }
        Relationships: []
      }
      course_videos: {
        Row: {
          created_at: string
          description: string | null
          duration_minutes: number | null
          embed_code: string | null
          external_url: string | null
          id: string
          module_category: string
          platform_source: string | null
          thumbnail_url: string | null
          title: string
          updated_at: string
          video_order: number | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          embed_code?: string | null
          external_url?: string | null
          id?: string
          module_category: string
          platform_source?: string | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          video_order?: number | null
        }
        Update: {
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          embed_code?: string | null
          external_url?: string | null
          id?: string
          module_category?: string
          platform_source?: string | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          video_order?: number | null
        }
        Relationships: []
      }
      documents: {
        Row: {
          content: string | null
          embedding: string | null
          id: number
          metadata: Json | null
        }
        Insert: {
          content?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Update: {
          content?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Relationships: []
      }
      events: {
        Row: {
          cidade: string
          created_at: string
          data_evento: string
          expires_at: string
          fornecedores_necessarios: string[]
          id: string
          nome: string
          orcamento_alvo: number | null
          publico_estimado: number
          status: string
          status_geral: string
          tipo_evento: string
          uf: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          cidade: string
          created_at?: string
          data_evento: string
          expires_at?: string
          fornecedores_necessarios: string[]
          id?: string
          nome: string
          orcamento_alvo?: number | null
          publico_estimado: number
          status?: string
          status_geral?: string
          tipo_evento: string
          uf: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          cidade?: string
          created_at?: string
          data_evento?: string
          expires_at?: string
          fornecedores_necessarios?: string[]
          id?: string
          nome?: string
          orcamento_alvo?: number | null
          publico_estimado?: number
          status?: string
          status_geral?: string
          tipo_evento?: string
          uf?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      family_members: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      installments: {
        Row: {
          amount: number
          created_at: string
          due_date: string
          id: string
          installment_number: number
          status: string
          transaction_id: string
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          due_date: string
          id?: string
          installment_number: number
          status?: string
          transaction_id: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          due_date?: string
          id?: string
          installment_number?: number
          status?: string
          transaction_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "installments_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      meeting_analytics: {
        Row: {
          action_items_identified: number | null
          agenda_followed: boolean | null
          average_sentence_length: number | null
          created_at: string
          decision_points: number | null
          follow_up_scheduled: boolean | null
          id: string
          meeting_id: string
          next_steps_defined: boolean | null
          objections_handled: number | null
          questions_asked: number | null
          total_words: number | null
          updated_at: string
        }
        Insert: {
          action_items_identified?: number | null
          agenda_followed?: boolean | null
          average_sentence_length?: number | null
          created_at?: string
          decision_points?: number | null
          follow_up_scheduled?: boolean | null
          id?: string
          meeting_id: string
          next_steps_defined?: boolean | null
          objections_handled?: number | null
          questions_asked?: number | null
          total_words?: number | null
          updated_at?: string
        }
        Update: {
          action_items_identified?: number | null
          agenda_followed?: boolean | null
          average_sentence_length?: number | null
          created_at?: string
          decision_points?: number | null
          follow_up_scheduled?: boolean | null
          id?: string
          meeting_id?: string
          next_steps_defined?: boolean | null
          objections_handled?: number | null
          questions_asked?: number | null
          total_words?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "meeting_analytics_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "meetings"
            referencedColumns: ["id"]
          },
        ]
      }
      meeting_insights: {
        Row: {
          client_objections: string[] | null
          commitments: string[] | null
          created_at: string
          id: string
          interest_score: number | null
          keywords: string[] | null
          meeting_id: string
          next_steps: string[] | null
          opportunities: string[] | null
          pain_points: string[] | null
          risks: string[] | null
          sentiment: string | null
          updated_at: string
          value_proposition: string | null
        }
        Insert: {
          client_objections?: string[] | null
          commitments?: string[] | null
          created_at?: string
          id?: string
          interest_score?: number | null
          keywords?: string[] | null
          meeting_id: string
          next_steps?: string[] | null
          opportunities?: string[] | null
          pain_points?: string[] | null
          risks?: string[] | null
          sentiment?: string | null
          updated_at?: string
          value_proposition?: string | null
        }
        Update: {
          client_objections?: string[] | null
          commitments?: string[] | null
          created_at?: string
          id?: string
          interest_score?: number | null
          keywords?: string[] | null
          meeting_id?: string
          next_steps?: string[] | null
          opportunities?: string[] | null
          pain_points?: string[] | null
          risks?: string[] | null
          sentiment?: string | null
          updated_at?: string
          value_proposition?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meeting_insights_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "meetings"
            referencedColumns: ["id"]
          },
        ]
      }
      meeting_keywords: {
        Row: {
          category: string | null
          created_at: string
          frequency: number | null
          id: string
          keyword: string
          meeting_id: string
          relevance_score: number | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          frequency?: number | null
          id?: string
          keyword: string
          meeting_id: string
          relevance_score?: number | null
        }
        Update: {
          category?: string | null
          created_at?: string
          frequency?: number | null
          id?: string
          keyword?: string
          meeting_id?: string
          relevance_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "meeting_keywords_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "meetings"
            referencedColumns: ["id"]
          },
        ]
      }
      meeting_participants: {
        Row: {
          company: string | null
          created_at: string
          email: string | null
          id: string
          meeting_id: string
          name: string
          role: string | null
          speaking_time_seconds: number | null
        }
        Insert: {
          company?: string | null
          created_at?: string
          email?: string | null
          id?: string
          meeting_id: string
          name: string
          role?: string | null
          speaking_time_seconds?: number | null
        }
        Update: {
          company?: string | null
          created_at?: string
          email?: string | null
          id?: string
          meeting_id?: string
          name?: string
          role?: string | null
          speaking_time_seconds?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "meeting_participants_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "meetings"
            referencedColumns: ["id"]
          },
        ]
      }
      meetings: {
        Row: {
          attachment_docx_name: string | null
          attachment_docx_url: string | null
          attachment_vtt_name: string | null
          attachment_vtt_url: string | null
          business_unit: string | null
          client_company: string | null
          corrected_transcript: string | null
          created_at: string
          duration_seconds: number | null
          end_time: string | null
          engagement_score: number | null
          executive_summary: string | null
          external_meeting_id: string | null
          external_participant_count: number | null
          id: string
          join_url: string | null
          meeting_type: string
          organizer_email: string | null
          organizer_name: string | null
          playbook_score: number | null
          processed_at: string | null
          quality_score: number | null
          raw_content: string | null
          sentiment_score: number | null
          start_time: string | null
          status: string
          title: string
          total_participant_count: number | null
          updated_at: string
          user_email: string | null
          user_id: string
          word_count: number | null
        }
        Insert: {
          attachment_docx_name?: string | null
          attachment_docx_url?: string | null
          attachment_vtt_name?: string | null
          attachment_vtt_url?: string | null
          business_unit?: string | null
          client_company?: string | null
          corrected_transcript?: string | null
          created_at?: string
          duration_seconds?: number | null
          end_time?: string | null
          engagement_score?: number | null
          executive_summary?: string | null
          external_meeting_id?: string | null
          external_participant_count?: number | null
          id?: string
          join_url?: string | null
          meeting_type?: string
          organizer_email?: string | null
          organizer_name?: string | null
          playbook_score?: number | null
          processed_at?: string | null
          quality_score?: number | null
          raw_content?: string | null
          sentiment_score?: number | null
          start_time?: string | null
          status?: string
          title: string
          total_participant_count?: number | null
          updated_at?: string
          user_email?: string | null
          user_id: string
          word_count?: number | null
        }
        Update: {
          attachment_docx_name?: string | null
          attachment_docx_url?: string | null
          attachment_vtt_name?: string | null
          attachment_vtt_url?: string | null
          business_unit?: string | null
          client_company?: string | null
          corrected_transcript?: string | null
          created_at?: string
          duration_seconds?: number | null
          end_time?: string | null
          engagement_score?: number | null
          executive_summary?: string | null
          external_meeting_id?: string | null
          external_participant_count?: number | null
          id?: string
          join_url?: string | null
          meeting_type?: string
          organizer_email?: string | null
          organizer_name?: string | null
          playbook_score?: number | null
          processed_at?: string | null
          quality_score?: number | null
          raw_content?: string | null
          sentiment_score?: number | null
          start_time?: string | null
          status?: string
          title?: string
          total_participant_count?: number | null
          updated_at?: string
          user_email?: string | null
          user_id?: string
          word_count?: number | null
        }
        Relationships: []
      }
      personal_notes: {
        Row: {
          content: string | null
          created_at: string
          id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      playbook_rules: {
        Row: {
          business_unit: string | null
          created_at: string
          id: string
          is_active: boolean | null
          keywords: string[] | null
          max_score: number | null
          meeting_type: string
          min_score: number | null
          rule_description: string | null
          rule_name: string
          updated_at: string
          weight: number | null
        }
        Insert: {
          business_unit?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          keywords?: string[] | null
          max_score?: number | null
          meeting_type: string
          min_score?: number | null
          rule_description?: string | null
          rule_name: string
          updated_at?: string
          weight?: number | null
        }
        Update: {
          business_unit?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          keywords?: string[] | null
          max_score?: number | null
          meeting_type?: string
          min_score?: number | null
          rule_description?: string | null
          rule_name?: string
          updated_at?: string
          weight?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          business_unit: string | null
          created_at: string
          department: string | null
          email: string
          full_name: string | null
          id: string
          phone: string | null
          role: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          business_unit?: string | null
          created_at?: string
          department?: string | null
          email: string
          full_name?: string | null
          id?: string
          phone?: string | null
          role?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          business_unit?: string | null
          created_at?: string
          department?: string | null
          email?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          role?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          alert_sent: boolean | null
          created_at: string
          data_limite: string
          event_id: string
          expires_at: string
          fornecedores_selecionados: string[] | null
          id: string
          nome_projeto: string
          observacoes: string | null
          project_status: string
          renewal_count: number | null
          renewal_history: Json | null
          renewal_requested: boolean | null
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          alert_sent?: boolean | null
          created_at?: string
          data_limite: string
          event_id: string
          expires_at?: string
          fornecedores_selecionados?: string[] | null
          id?: string
          nome_projeto: string
          observacoes?: string | null
          project_status?: string
          renewal_count?: number | null
          renewal_history?: Json | null
          renewal_requested?: boolean | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          alert_sent?: boolean | null
          created_at?: string
          data_limite?: string
          event_id?: string
          expires_at?: string
          fornecedores_selecionados?: string[] | null
          id?: string
          nome_projeto?: string
          observacoes?: string | null
          project_status?: string
          renewal_count?: number | null
          renewal_history?: Json | null
          renewal_requested?: boolean | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      quotes: {
        Row: {
          combos: Json
          created_at: string
          event_id: string
          fornecedores_necessarios: string[]
          id: string
          nome: string | null
          observacoes: string | null
          orcamento_total: number
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          combos?: Json
          created_at?: string
          event_id: string
          fornecedores_necessarios: string[]
          id?: string
          nome?: string | null
          observacoes?: string | null
          orcamento_total: number
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          combos?: Json
          created_at?: string
          event_id?: string
          fornecedores_necessarios?: string[]
          id?: string
          nome?: string | null
          observacoes?: string | null
          orcamento_total?: number
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quotes_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      recordings: {
        Row: {
          created_at: string
          duration_seconds: number | null
          file_path: string | null
          file_size: number | null
          format: string | null
          id: string
          meeting_id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          duration_seconds?: number | null
          file_path?: string | null
          file_size?: number | null
          format?: string | null
          id?: string
          meeting_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          duration_seconds?: number | null
          file_path?: string | null
          file_size?: number | null
          format?: string | null
          id?: string
          meeting_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "recordings_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "meetings"
            referencedColumns: ["id"]
          },
        ]
      }
      security_audit_log: {
        Row: {
          created_at: string | null
          details: Json | null
          event_type: string
          id: string
          ip_address: unknown | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          details?: Json | null
          event_type: string
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          details?: Json | null
          event_type?: string
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      supplier_attachments: {
        Row: {
          description: string | null
          document_type: string
          file_name: string
          file_path: string
          file_size: number | null
          file_type: string
          id: string
          is_current_version: boolean | null
          is_public: boolean | null
          replaces_attachment_id: string | null
          supplier_id: string
          title: string
          updated_at: string
          uploaded_at: string
          version: number | null
        }
        Insert: {
          description?: string | null
          document_type: string
          file_name: string
          file_path: string
          file_size?: number | null
          file_type: string
          id?: string
          is_current_version?: boolean | null
          is_public?: boolean | null
          replaces_attachment_id?: string | null
          supplier_id: string
          title: string
          updated_at?: string
          uploaded_at?: string
          version?: number | null
        }
        Update: {
          description?: string | null
          document_type?: string
          file_name?: string
          file_path?: string
          file_size?: number | null
          file_type?: string
          id?: string
          is_current_version?: boolean | null
          is_public?: boolean | null
          replaces_attachment_id?: string | null
          supplier_id?: string
          title?: string
          updated_at?: string
          uploaded_at?: string
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "supplier_attachments_replaces_attachment_id_fkey"
            columns: ["replaces_attachment_id"]
            isOneToOne: false
            referencedRelation: "supplier_attachments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_attachments_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      supplier_pricing: {
        Row: {
          advance_payment_percent: number | null
          cancellation_policy: string | null
          capacity_max: number | null
          capacity_min: number | null
          cleanup_fee: number | null
          created_at: string
          description: string | null
          discount_conditions: string | null
          display_order: number | null
          event_types: string[] | null
          holiday_multiplier: number | null
          id: string
          is_active: boolean | null
          overtime_rate: number | null
          package_deals: string[] | null
          payment_terms: string | null
          peak_season_multiplier: number | null
          price_max: number | null
          price_min: number | null
          pricing_type: string
          service_name: string
          setup_fee: number | null
          supplier_id: string
          travel_fee: number | null
          unit_type: string | null
          updated_at: string
          weekend_multiplier: number | null
        }
        Insert: {
          advance_payment_percent?: number | null
          cancellation_policy?: string | null
          capacity_max?: number | null
          capacity_min?: number | null
          cleanup_fee?: number | null
          created_at?: string
          description?: string | null
          discount_conditions?: string | null
          display_order?: number | null
          event_types?: string[] | null
          holiday_multiplier?: number | null
          id?: string
          is_active?: boolean | null
          overtime_rate?: number | null
          package_deals?: string[] | null
          payment_terms?: string | null
          peak_season_multiplier?: number | null
          price_max?: number | null
          price_min?: number | null
          pricing_type: string
          service_name: string
          setup_fee?: number | null
          supplier_id: string
          travel_fee?: number | null
          unit_type?: string | null
          updated_at?: string
          weekend_multiplier?: number | null
        }
        Update: {
          advance_payment_percent?: number | null
          cancellation_policy?: string | null
          capacity_max?: number | null
          capacity_min?: number | null
          cleanup_fee?: number | null
          created_at?: string
          description?: string | null
          discount_conditions?: string | null
          display_order?: number | null
          event_types?: string[] | null
          holiday_multiplier?: number | null
          id?: string
          is_active?: boolean | null
          overtime_rate?: number | null
          package_deals?: string[] | null
          payment_terms?: string | null
          peak_season_multiplier?: number | null
          price_max?: number | null
          price_min?: number | null
          pricing_type?: string
          service_name?: string
          setup_fee?: number | null
          supplier_id?: string
          travel_fee?: number | null
          unit_type?: string | null
          updated_at?: string
          weekend_multiplier?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "supplier_pricing_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          acessibilidade: string | null
          area: number | null
          avaliacao_interna: number | null
          bairro: string | null
          bebidas_inclusas: boolean | null
          capacidade_coquetel: number | null
          capacidade_sentado: number | null
          cardapios_disponiveis: string[] | null
          categoria_premium: number | null
          cep: string | null
          cidade: string
          created_at: string
          desmontagem_horas: number | null
          direito_uso_imagem: boolean | null
          email: string | null
          endereco: string | null
          entrega_dias: number | null
          entrega_formato: string | null
          equipamentos_disponiveis: string[] | null
          equipe_garcons: number | null
          equipe_tecnicos: number | null
          estacionamento_vagas: number | null
          estilos_decoracao: string[] | null
          exclusividade_marca: boolean | null
          horario_funcionamento: string | null
          horas_cobertura_base: number | null
          id: string
          instagram: string | null
          internet: string | null
          itens_padrao: string | null
          latitude: number | null
          linkedin: string | null
          lista_equipamentos: string | null
          longitude: number | null
          montagem_horas: number | null
          nome: string
          nps_historico: number | null
          observacoes: string | null
          personalizacao: boolean | null
          politica_terceiros: string | null
          prazo_montagem_horas: number | null
          preco_por_pessoa_base: number | null
          preco_por_pessoa_max: number | null
          restricoes_ruido: string | null
          status: string
          taxa_servico: number | null
          tecnicos_inclusos: number | null
          telefone: string | null
          tipo: string
          tipos_cardapio: string[] | null
          transmissao_vivo: boolean | null
          uf: string
          updated_at: string
          user_id: string | null
          vista_panoramica: boolean | null
          website: string | null
          whatsapp: string | null
        }
        Insert: {
          acessibilidade?: string | null
          area?: number | null
          avaliacao_interna?: number | null
          bairro?: string | null
          bebidas_inclusas?: boolean | null
          capacidade_coquetel?: number | null
          capacidade_sentado?: number | null
          cardapios_disponiveis?: string[] | null
          categoria_premium?: number | null
          cep?: string | null
          cidade: string
          created_at?: string
          desmontagem_horas?: number | null
          direito_uso_imagem?: boolean | null
          email?: string | null
          endereco?: string | null
          entrega_dias?: number | null
          entrega_formato?: string | null
          equipamentos_disponiveis?: string[] | null
          equipe_garcons?: number | null
          equipe_tecnicos?: number | null
          estacionamento_vagas?: number | null
          estilos_decoracao?: string[] | null
          exclusividade_marca?: boolean | null
          horario_funcionamento?: string | null
          horas_cobertura_base?: number | null
          id?: string
          instagram?: string | null
          internet?: string | null
          itens_padrao?: string | null
          latitude?: number | null
          linkedin?: string | null
          lista_equipamentos?: string | null
          longitude?: number | null
          montagem_horas?: number | null
          nome: string
          nps_historico?: number | null
          observacoes?: string | null
          personalizacao?: boolean | null
          politica_terceiros?: string | null
          prazo_montagem_horas?: number | null
          preco_por_pessoa_base?: number | null
          preco_por_pessoa_max?: number | null
          restricoes_ruido?: string | null
          status?: string
          taxa_servico?: number | null
          tecnicos_inclusos?: number | null
          telefone?: string | null
          tipo: string
          tipos_cardapio?: string[] | null
          transmissao_vivo?: boolean | null
          uf: string
          updated_at?: string
          user_id?: string | null
          vista_panoramica?: boolean | null
          website?: string | null
          whatsapp?: string | null
        }
        Update: {
          acessibilidade?: string | null
          area?: number | null
          avaliacao_interna?: number | null
          bairro?: string | null
          bebidas_inclusas?: boolean | null
          capacidade_coquetel?: number | null
          capacidade_sentado?: number | null
          cardapios_disponiveis?: string[] | null
          categoria_premium?: number | null
          cep?: string | null
          cidade?: string
          created_at?: string
          desmontagem_horas?: number | null
          direito_uso_imagem?: boolean | null
          email?: string | null
          endereco?: string | null
          entrega_dias?: number | null
          entrega_formato?: string | null
          equipamentos_disponiveis?: string[] | null
          equipe_garcons?: number | null
          equipe_tecnicos?: number | null
          estacionamento_vagas?: number | null
          estilos_decoracao?: string[] | null
          exclusividade_marca?: boolean | null
          horario_funcionamento?: string | null
          horas_cobertura_base?: number | null
          id?: string
          instagram?: string | null
          internet?: string | null
          itens_padrao?: string | null
          latitude?: number | null
          linkedin?: string | null
          lista_equipamentos?: string | null
          longitude?: number | null
          montagem_horas?: number | null
          nome?: string
          nps_historico?: number | null
          observacoes?: string | null
          personalizacao?: boolean | null
          politica_terceiros?: string | null
          prazo_montagem_horas?: number | null
          preco_por_pessoa_base?: number | null
          preco_por_pessoa_max?: number | null
          restricoes_ruido?: string | null
          status?: string
          taxa_servico?: number | null
          tecnicos_inclusos?: number | null
          telefone?: string | null
          tipo?: string
          tipos_cardapio?: string[] | null
          transmissao_vivo?: boolean | null
          uf?: string
          updated_at?: string
          user_id?: string | null
          vista_panoramica?: boolean | null
          website?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      transactions: {
        Row: {
          account_id: string | null
          category_id: string | null
          created_at: string
          description: string
          id: string
          installment_count: number | null
          installment_start_date: string | null
          is_installment: boolean | null
          is_recurring: boolean | null
          payer_member_id: string | null
          payment_method: string | null
          recurrence_end_date: string | null
          recurrence_type: string | null
          responsible_member_id: string | null
          total_amount: number
          transaction_date: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          account_id?: string | null
          category_id?: string | null
          created_at?: string
          description: string
          id?: string
          installment_count?: number | null
          installment_start_date?: string | null
          is_installment?: boolean | null
          is_recurring?: boolean | null
          payer_member_id?: string | null
          payment_method?: string | null
          recurrence_end_date?: string | null
          recurrence_type?: string | null
          responsible_member_id?: string | null
          total_amount: number
          transaction_date: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          account_id?: string | null
          category_id?: string | null
          created_at?: string
          description?: string
          id?: string
          installment_count?: number | null
          installment_start_date?: string | null
          is_installment?: boolean | null
          is_recurring?: boolean | null
          payer_member_id?: string | null
          payment_method?: string | null
          recurrence_end_date?: string | null
          recurrence_type?: string | null
          responsible_member_id?: string | null
          total_amount?: number
          transaction_date?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_payer_member_id_fkey"
            columns: ["payer_member_id"]
            isOneToOne: false
            referencedRelation: "family_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_responsible_member_id_fkey"
            columns: ["responsible_member_id"]
            isOneToOne: false
            referencedRelation: "family_members"
            referencedColumns: ["id"]
          },
        ]
      }
      transcriptions: {
        Row: {
          confidence_score: number | null
          content: string | null
          created_at: string
          id: string
          language: string | null
          recording_id: string
          status: string
          updated_at: string
        }
        Insert: {
          confidence_score?: number | null
          content?: string | null
          created_at?: string
          id?: string
          language?: string | null
          recording_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          confidence_score?: number | null
          content?: string | null
          created_at?: string
          id?: string
          language?: string | null
          recording_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "transcriptions_recording_id_fkey"
            columns: ["recording_id"]
            isOneToOne: false
            referencedRelation: "recordings"
            referencedColumns: ["id"]
          },
        ]
      }
      user_workflows_created: {
        Row: {
          created_at: string
          file_name: string | null
          id: string
          updated_at: string
          user_id: string
          video_id: string
          workflow_json: Json | null
          workflows_count: number
        }
        Insert: {
          created_at?: string
          file_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
          video_id: string
          workflow_json?: Json | null
          workflows_count?: number
        }
        Update: {
          created_at?: string
          file_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
          video_id?: string
          workflow_json?: Json | null
          workflows_count?: number
        }
        Relationships: []
      }
      workflow_categories: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          icon: string | null
          id: string
          name: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      workflow_documentation: {
        Row: {
          content: string | null
          created_at: string
          id: string
          prerequisites: string[] | null
          setup_instructions: string | null
          updated_at: string
          workflow_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          prerequisites?: string[] | null
          setup_instructions?: string | null
          updated_at?: string
          workflow_id: string
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          prerequisites?: string[] | null
          setup_instructions?: string | null
          updated_at?: string
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_documentation_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: true
            referencedRelation: "workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_favorites: {
        Row: {
          created_at: string
          id: string
          user_id: string
          workflow_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          user_id: string
          workflow_id: string
        }
        Update: {
          created_at?: string
          id?: string
          user_id?: string
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_favorites_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_files: {
        Row: {
          content: Json
          created_at: string
          file_size: number | null
          id: string
          workflow_id: string
        }
        Insert: {
          content: Json
          created_at?: string
          file_size?: number | null
          id?: string
          workflow_id: string
        }
        Update: {
          content?: Json
          created_at?: string
          file_size?: number | null
          id?: string
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_files_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: true
            referencedRelation: "workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      workflows: {
        Row: {
          author: string | null
          category: string | null
          complexity_level: string | null
          created_at: string
          description: string | null
          file_path: string
          github_url: string | null
          id: string
          is_active: boolean | null
          n8n_version: string | null
          name: string
          node_count: number | null
          tags: string[] | null
          updated_at: string
        }
        Insert: {
          author?: string | null
          category?: string | null
          complexity_level?: string | null
          created_at?: string
          description?: string | null
          file_path: string
          github_url?: string | null
          id?: string
          is_active?: boolean | null
          n8n_version?: string | null
          name: string
          node_count?: number | null
          tags?: string[] | null
          updated_at?: string
        }
        Update: {
          author?: string | null
          category?: string | null
          complexity_level?: string | null
          created_at?: string
          description?: string | null
          file_path?: string
          github_url?: string | null
          id?: string
          is_active?: boolean | null
          n8n_version?: string | null
          name?: string
          node_count?: number | null
          tags?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      expiring_items: {
        Row: {
          days_remaining: number | null
          expires_at: string | null
          id: string | null
          item_type: string | null
          name: string | null
          renewal_count: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      check_project_alerts: {
        Args: Record<PropertyKey, never>
        Returns: {
          days_remaining: number
          nome_projeto: string
          project_id: string
        }[]
      }
      generate_workflow_documentation: {
        Args: { workflow_content: Json }
        Returns: string
      }
      get_course_leaderboard: {
        Args: Record<PropertyKey, never>
        Returns: {
          display_name: string
          rank: number
          score: number
          user_id: string
        }[]
      }
      get_user_leaderboard_position: {
        Args: { target_user_id: string }
        Returns: {
          course_rank: number
          course_score: number
          workflow_rank: number
          workflow_score: number
        }[]
      }
      get_workflow_leaderboard: {
        Args: Record<PropertyKey, never>
        Returns: {
          display_name: string
          rank: number
          score: number
          user_id: string
        }[]
      }
      log_security_event: {
        Args: { details?: Json; event_type: string; user_id?: string }
        Returns: undefined
      }
      renew_project: {
        Args: { project_id: string }
        Returns: boolean
      }
      validate_password_strength: {
        Args: { password: string }
        Returns: boolean
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
