export type TabId = 'face' | 'burst' | 'prosody';

export interface Tab {
    id: TabId;
    label: string;
}

export const tabs: Tab[] = [
    { id: 'face', label: 'Facial expression' },
    { id: 'burst', label: 'Vocal Burst' },
    { id: 'prosody', label: 'Speech Prosody' }
];
