export enum PMCTrackEvent {
  PMC_DEPOSIT_TASK_CARD_CLICKED = 'PMC Deposit Task Card Clicked',
  PMC_DEPOSIT_CREATED = 'PMC Deposit Created',
  PMC_DEPOSIT_PREVIEWED = 'PMC Deposit Previewed',
  PMC_DEPOSIT_CONFIRMED = 'PMC Deposit Confirmed',
  PMC_DOI_LOOKUP_SUCCEEDED = 'PMC DOI Lookup Succeeded',
  PMC_DOI_LOOKUP_FAILED = 'PMC DOI Lookup Failed',
}

export const PMCTrackEventDescriptions: Record<PMCTrackEvent, string> = {
  [PMCTrackEvent.PMC_DEPOSIT_TASK_CARD_CLICKED]: 'User clicked the PMC deposit task card',
  [PMCTrackEvent.PMC_DEPOSIT_CREATED]: 'PMC deposit work created',
  [PMCTrackEvent.PMC_DEPOSIT_PREVIEWED]: 'PMC deposit previewed before submission',
  [PMCTrackEvent.PMC_DEPOSIT_CONFIRMED]: 'PMC deposit confirmed and submitted',
  [PMCTrackEvent.PMC_DOI_LOOKUP_SUCCEEDED]: 'DOI lookup succeeded for PMC deposit',
  [PMCTrackEvent.PMC_DOI_LOOKUP_FAILED]: 'DOI lookup failed for PMC deposit',
};
