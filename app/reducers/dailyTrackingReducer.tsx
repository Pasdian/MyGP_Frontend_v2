// src/reducers/dailyTrackingReducer.ts
import type { DailyTracking } from '@/types/dashboard/tracking/dailyTracking';
import { formatISOtoDDMMYYYY } from '@/lib/utilityFunctions/formatISOtoDDMMYYYY';

export type DailyTrackingState = DailyTracking[];

export type DailyTrackingAction =
  | {
      type: 'setAll';
      payload: DailyTracking[];
    }
  | {
      type: 'updateStatus';
      payload: {
        numRefe: DailyTracking['NUM_REFE'];
        status: string;
        modifiedAt: string;
      };
    };

export function dailyTrackingReducer(
  state: DailyTrackingState,
  action: DailyTrackingAction
): DailyTrackingState {
  switch (action.type) {
    case 'setAll':
      return action.payload;

    case 'updateStatus': {
      const { numRefe, status, modifiedAt } = action.payload;

      return state.map((r) =>
        r.NUM_REFE === numRefe
          ? {
              ...r,
              STATUS: status,
              MODIFIED_AT: modifiedAt,
              MODIFIED_AT_FORMATTED: formatISOtoDDMMYYYY(modifiedAt),
            }
          : r
      );
    }

    default:
      return state;
  }
}
