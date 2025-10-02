import type { FamilyMember } from './types';

// This file contains static data for families and their members.
// It's used for registration and to display family members in the app.
// In a real-world scenario with dynamic family creation, this would be handled differently,
// but for this app, it provides a stable and secure way to manage family structures.

// NOTE: The 'id' for each member MUST be unique across all families.
// The 'email' must match the email used for registration to link the Firebase Auth user
// to the static member data.

export const familyData = [
    {
        id: 'Familie-Butz-Braun',
        name: 'Familie Butz/Braun',
        code: 'Rolf1784',
        members: [
            { id: 'user-lukas', name: 'Lukas Braun', email: 'lulubraun1999@gmail.com', avatar: {}, color: 'hsl(var(--chart-1))' },
            { id: 'user-lena', name: 'Lena Butz', email: 'lena.butz@example.com', avatar: {}, color: 'hsl(var(--chart-2))' }
        ]
    },
    {
        id: 'Familie-Weiss-Froehle',
        name: 'Familie Weiß/Fröhle',
        code: 'Rolf1784',
        members: [
            // Add members of Familie Weiß/Fröhle here
        ]
    },
    {
        id: 'Familie-Froehle',
        name: 'Familie Fröhle',
        code: 'Rolf1784',
        members: [
            // Add members of Familie Fröhle here
        ]
    }
];

// A flat list of all members for easier lookup.
export const allFamilyMembers: FamilyMember[] = familyData.flatMap(f => f.members);