/**
 * 공통 상태 화면 — 빈 결과 · 처리 중 · 실패 (화면설계서 StateScreens, S209~S211).
 *
 * 규칙: 다음에 할 일을 한 줄로 안내하고, 필요하면 동작 버튼 하나를 둔다.
 * - 처리 중: 단계 이름 · 남은 시간(알 때)을 보이고 aria-busy 로 바쁨을 알린다.
 * - 실패: role=alert 로 알린다. 이미 입력한 값은 그대로 둔다는 전제로, 「다시 입력」을 요구하지 않는다.
 * 업무와 무관한 공용 부품이라 components/ 평면에 둔다.
 */
import type { ReactNode } from 'react'
import { AlertTriangle, Inbox, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export type StateKind = 'empty' | 'loading' | 'error'

interface StateScreenProps {
  kind: StateKind
  /** 큰 줄 — 비우면 종류별 기본 문구 */
  title?: string
  /** 다음에 할 일 한 줄 */
  hint?: string
  /** 처리 중 단계 이름 (예: 변경 후보 찾기) */
  stage?: string
  /** 처리 중 남은 시간(분) */
  etaMinutes?: number
  /** 동작 버튼 하나 */
  action?: ReactNode
  className?: string
}

const DEFAULT_TITLE: Record<StateKind, string> = {
  empty: '조건에 맞는 결과가 없습니다',
  loading: '불러오는 중입니다',
  error: '불러오지 못했습니다',
}

export function StateScreen({ kind, title, hint, stage, etaMinutes, action, className }: StateScreenProps) {
  const Icon = kind === 'loading' ? Loader2 : kind === 'error' ? AlertTriangle : Inbox
  return (
    <div
      className={cn('flex flex-col items-center gap-2 px-6 py-12 text-center', className)}
      role={kind === 'error' ? 'alert' : 'status'}
      aria-busy={kind === 'loading' || undefined}
    >
      <Icon
        className={cn(
          'size-8',
          kind === 'loading' && 'animate-spin text-primary',
          kind === 'error' && 'text-state-late',
          kind === 'empty' && 'text-muted-foreground',
        )}
        aria-hidden
      />
      <p className="text-base font-medium text-foreground">{title ?? DEFAULT_TITLE[kind]}</p>
      {kind === 'loading' && (stage || etaMinutes !== undefined) && (
        <p className="text-sm text-muted-foreground">
          {stage}
          {stage && etaMinutes !== undefined && ' · '}
          {etaMinutes !== undefined && `약 ${etaMinutes}분 남음`}
        </p>
      )}
      {hint && <p className="max-w-md text-sm text-muted-foreground">{hint}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}
