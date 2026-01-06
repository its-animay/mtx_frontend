import { useMutation, useQuery } from "@tanstack/react-query"
import { masterClient } from "@/shared/lib/http/masterClient"

export interface TestInstructionsResponse {
  schema_version: string
  test: {
    test_id: string
    name: string
    description?: string
    exam_family?: string
    exam_stage?: string
    attempt_type?: string
    tags?: string[]
    language?: { primary?: string; available?: string[] }
  }
  availability?: {
    mode?: string
    start_at?: string
    end_at?: string
    time_zone?: string
  }
  structure?: {
    papers?: Array<{
      paper_id: string
      title: string
      description?: string
      question_pool?: { total_questions?: number }
      duration?: { total_seconds?: number }
      navigation?: {
        allow_jump?: boolean
        allow_back?: boolean
        allow_answer_change?: boolean
        allow_mark_for_review?: boolean
      }
      marking?: {
        default_scheme?: {
          correct?: number
          incorrect?: number
          unattempted?: number
        }
      }
    }>
  }
  attempt_rules?: {
    max_attempts?: number
    auto_submit_on_timeup?: boolean
    allow_review_before_submit?: boolean
    allow_section_navigation?: boolean
    allow_question_jump?: boolean
    allow_answer_change?: boolean
  }
  security_and_proctoring?: {
    proctoring_mode?: string
    fullscreen_required?: boolean
    tab_switch_limit?: number
    copy_paste_allowed?: boolean
    right_click_allowed?: boolean
    camera_required?: boolean
    microphone_required?: boolean
    identity_verification?: boolean
  }
  instructions?: {
    display?: { acknowledgement_text?: string }
    content?: {
      general?: string[]
      time?: string[]
      navigation?: string[]
      marking?: string[]
      conduct?: string[]
      technical?: string[]
      submission?: string[]
      paper_specific?: Record<string, string[]>
    }
  }
  support?: {
    helpdesk?: { email?: string; phone?: string; chat_url?: string }
    incident_policy?: string
  }
  ui_hints?: Record<string, unknown>
}

export function useTestInstructions(testId?: string) {
  return useQuery({
    queryKey: ["test", "instructions", testId],
    queryFn: async () => {
      if (!testId) throw new Error("Missing testId")
      const { data } = await masterClient.get(`/tests/${testId}/instructions`)
      return data as TestInstructionsResponse
    },
    enabled: Boolean(testId),
  })
}

export interface CreateAttemptResponse {
  attempt_id: string
  test_id: string
}

export function useCreateAttempt(testId?: string) {
  return useMutation<CreateAttemptResponse, any, { source?: string }>({
    mutationFn: async (payload) => {
      if (!testId) throw new Error("Missing testId")
      const { data } = await masterClient.post(`/tests/${testId}/attempts`, {
        accepted_instructions: true,
        accepted_at: new Date().toISOString(),
        source: payload.source || "instructions_page",
      })
      return data
    },
  })
}
