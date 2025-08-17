import WorkshopRegistration from "@/components/WorkshopRegistration";

export default function Page() {
    const workshopBlocks = {
        "Block A": [
            {
                id: "block-a-1",
                title: "Building Bridges Across Communities",
                description: "A panel of community builders sharing their experiences cultivating creative cultures.",
                speaker: "Jordan Deja",
                role: "Director & Advisory Board @ UXPH",
                slotsLeft: 15
            },
            {
                id: "block-a-2",
                title: "Community Leadership in Design",
                description: "Strategies for leading and growing design communities across the Philippines.",
                speaker: "Karl dela Cruz",
                role: "Community Lead @ CebUXD",
                slotsLeft: 8
            },
            {
                id: "block-a-3",
                title: "Fostering Creative Cultures",
                description: "How to build and nurture creative environments in your community.",
                speaker: "Shannen Yu Sapaar",
                role: "Co-founder & Community Lead @ UX Davao",
                slotsLeft: 23
            },
            {
                id: "block-a-4",
                title: "Design Systems for Communities",
                description: "Creating scalable design systems that work for community projects.",
                speaker: "Maria Santos",
                role: "Senior UX Designer @ Tech Company",
                slotsLeft: 3
            },
            {
                id: "block-a-5",
                title: "User Research in Local Context",
                description: "Conducting effective user research within Filipino cultural contexts.",
                speaker: "Carlos Reyes",
                role: "UX Researcher @ Local Startup",
                slotsLeft: 12
            },
            {
                id: "block-a-6",
                title: "Accessibility in Philippine Design",
                description: "Making digital products accessible for Filipino users with diverse needs.",
                speaker: "Ana Gutierrez",
                role: "Accessibility Consultant",
                slotsLeft: 0
            }
        ],
        "Block B": [
            {
                id: "block-b-1",
                title: "The Business of Design",
                description: "The unconventional path to building a sustainable business where people love to work and clients treat you as real partners.",
                speaker: "JP de Guzman",
                role: "Chief Creative and Founder @ Frost Design Group",
                slotsLeft: 7
            },
            {
                id: "block-b-2",
                title: "Freelancing as a Designer",
                description: "Building a successful freelance design career in the Philippines.",
                speaker: "Lisa Chen",
                role: "Freelance Brand Designer",
                slotsLeft: 18
            },
            {
                id: "block-b-3",
                title: "Design Agency Operations",
                description: "Running and scaling a design agency in the local market.",
                speaker: "Miguel Torres",
                role: "Founder @ Creative Agency",
                slotsLeft: 5
            },
            {
                id: "block-b-4",
                title: "Client Relationship Management",
                description: "Building lasting relationships with clients and managing expectations.",
                speaker: "Sarah Kim",
                role: "Design Director @ Consultancy",
                slotsLeft: 14
            },
            {
                id: "block-b-5",
                title: "Pricing Your Design Work",
                description: "Strategies for pricing design services competitively and profitably.",
                speaker: "Roberto Valdez",
                role: "Business Consultant for Creatives",
                slotsLeft: 1
            },
            {
                id: "block-b-6",
                title: "Design Portfolio Development",
                description: "Creating compelling portfolios that win clients and job opportunities.",
                speaker: "Jennifer Liu",
                role: "Senior Product Designer",
                slotsLeft: 20
            }
        ]
    };

    return <WorkshopRegistration workshopBlocks={workshopBlocks} />;
}
