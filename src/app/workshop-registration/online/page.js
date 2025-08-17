"use client";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";

const WorkshopRegistration = () => {
    const [selectedWorkshops, setSelectedWorkshops] = useState({
        "Block A": "",
        "Block B": ""
    });
    const [helixpayCode, setHelixpayCode] = useState("");
    const [message, setMessage] = useState({
        status: "info",
        message: "",
    });
    const [loading, setLoading] = useState(false);

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

    const handleSubmit = async () => {
        try {
            setMessage({
                status: "info",
                message: "",
            });
            setLoading(true);

            if (!selectedWorkshops["Block A"] || !selectedWorkshops["Block B"]) {
                throw new Error("Please select one workshop from both Block A and Block B to continue.");
            }

            if (!helixpayCode.trim()) {
                throw new Error("Please enter your Helixpay code to proceed with registration.");
            }

            // Simulate API call for registration
            await new Promise(resolve => setTimeout(resolve, 2000));

            setMessage({
                status: "success",
                message: "Registration successful! You will receive a confirmation email shortly.",
            });
            setLoading(false);
        } catch (e) {
            setMessage({
                status: "error",
                message: e?.message || "An error has occurred. Please contact us if the symptoms persist",
            });
            setLoading(false);
        }
    };

    let status = {
        info: "text-gray-400",
        error: "text-red-400",
        success: "text-green-400",
    };

    return (
        <div className="flex w-full min-h-screen bg-gray-800 text-white justify-center items-center flex-col py-8 px-4">
            <div className="flex items-center w-24 md:w-32 h-24 md:h-32 relative mb-6">
                <Image alt="UXPH Vertical Logo" src={"/uxph_vertical.svg"} fill={true} className="object-contain" />
            </div>
            
            <h1 className="text-2xl md:text-5xl font-bold mb-4 text-center">Workshop Registration</h1>
            <p className="text-base tracking-widest mb-8 text-center">Online Workshops</p>

            <div className="max-w-6xl w-full space-y-8">
                {Object.entries(workshopBlocks).map(([blockName, workshops]) => (
                    <div key={blockName} className="space-y-4">
                        <h2 className="text-xl md:text-2xl font-bold text-center text-[#ff6b6b] mb-6">
                            {blockName}
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {workshops.map((workshop) => (
                                <div 
                                    key={workshop.id}
                                    className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 relative ${
                                        selectedWorkshops[blockName] === workshop.id 
                                            ? 'border-[#1b50d8] bg-[#1b50d8]/10' 
                                            : 'border-gray-600 hover:border-gray-500'
                                    } ${workshop.slotsLeft === 0 ? 'opacity-60 cursor-not-allowed' : ''}`}
                                    onClick={() => {
                                        if (workshop.slotsLeft > 0) {
                                            setSelectedWorkshops(prev => ({
                                                ...prev,
                                                [blockName]: workshop.id
                                            }))
                                        }
                                    }}
                                >
                                    <div className="flex items-start space-x-3">
                                        <input
                                            type="radio"
                                            name={blockName}
                                            value={workshop.id}
                                            checked={selectedWorkshops[blockName] === workshop.id}
                                            onChange={(e) => setSelectedWorkshops(prev => ({
                                                ...prev,
                                                [blockName]: e.target.value
                                            }))}
                                            disabled={workshop.slotsLeft === 0}
                                            className="mt-1 w-4 h-4 text-[#1b50d8] bg-gray-800 border-gray-600 focus:ring-[#1b50d8] disabled:opacity-50 disabled:cursor-not-allowed"
                                        />
                                        <div className="flex-1">
                                            <h3 className="text-base md:text-lg font-semibold mb-2 text-white">
                                                {workshop.title}
                                            </h3>
                                            <p className="text-gray-300 text-sm mb-3">
                                                {workshop.description}
                                            </p>
                                            
                                            <div className="flex items-center space-x-3">
                                                <div className="w-8 h-8 bg-[#1b50d8] rounded-full flex items-center justify-center">
                                                    <span className="text-white font-semibold text-xs">
                                                        {workshop.speaker.split(' ').map(n => n[0]).join('')}
                                                    </span>
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-semibold text-[#1b50d8] text-sm">{workshop.speaker}</p>
                                                    <p className="text-xs text-gray-400">{workshop.role}</p>
                                                </div>
                                            </div>
                                            
                                            {/* Slots Left Indicator */}
                                            <div className="mt-3 pt-2 border-t border-gray-600">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs text-gray-400">Slots available:</span>
                                                    <div className={`px-2 py-1 rounded text-xs font-semibold ${
                                                        workshop.slotsLeft === 0 
                                                            ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                                                            : workshop.slotsLeft <= 5 
                                                                ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                                                                : 'bg-green-500/20 text-green-400 border border-green-500/30'
                                                    }`}>
                                                        {workshop.slotsLeft === 0 ? 'FULL' : `${workshop.slotsLeft} left`}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Selection Summary */}
            <div className="max-w-4xl w-full mt-8 mb-6">
                <div className="bg-gray-700 rounded-lg p-4 border border-gray-600">
                    <h3 className="text-lg font-semibold mb-3 text-center">Your Selections</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(selectedWorkshops).map(([blockName, workshopId]) => {
                            const selectedWorkshop = workshopBlocks[blockName]?.find(w => w.id === workshopId);
                            return (
                                <div key={blockName} className="text-center">
                                    <p className="font-semibold text-[#ff6b6b] mb-1">{blockName}</p>
                                    {selectedWorkshop ? (
                                        <div className="bg-[#1b50d8]/20 border border-[#1b50d8] rounded p-2">
                                            <p className="text-white text-sm font-medium">{selectedWorkshop.title}</p>
                                            <p className="text-[#1b50d8] text-xs">{selectedWorkshop.speaker}</p>
                                        </div>
                                    ) : (
                                        <div className="bg-gray-600 border border-gray-500 rounded p-2">
                                            <p className="text-gray-400 text-sm">No selection made</p>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="max-w-prose w-full mt-8">
                <p className="font-light text-base md:text-xl tracking-wide text-center mb-4">
                    Enter your{" "}
                    <span className="underline font-semibold">Helixpay code</span>{" "}
                    to proceed with your registration.
                </p>
                
                <div className="flex gap-4 md:text-lg text-base">
                    <input
                        type="text"
                        name="helixpayCode"
                        value={helixpayCode}
                        onChange={(e) => {
                            setMessage({ status: "info", message: "" });
                            setHelixpayCode(e.target.value);
                        }}
                        className="grow border border-white rounded-sm w-full py-2 px-3 bg-gray-800 text-white placeholder-gray-400"
                        placeholder="Enter your Helixpay code"
                    />
                    <button
                        disabled={loading || !selectedWorkshops["Block A"] || !selectedWorkshops["Block B"] || !helixpayCode.trim()}
                        className="relative disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer uppercase bg-[#1b50d8] hover:bg-[#1b50d8]/80 border border-[#1b50d8] py-2 px-6 rounded-sm font-semibold tracking-wider flex gap-2 items-center justify-center min-w-[120px]"
                        onClick={handleSubmit}
                    >
                        {loading && <span className="icon-[eos-icons--loading]"></span>}
                        <span>Register</span>
                    </button>
                </div>
                
                <div className="h-8 mt-2">
                    {message.message && (
                        <p className={`${status[message.status]} md:text-base text-sm text-center font-medium`}>
                            {message.message}
                        </p>
                    )}
                </div>
            </div>

            <p className="tracking-wide mt-8 text-center">Join the community and follow us for updates!</p>
            <div className="flex gap-5 items-center justify-center text-white text-xl md:text-2xl py-4">
                <Link
                    target="_blank"
                    href={"https://www.facebook.com/uxphofficial/"}
                    className="icon-[fa-brands--facebook] hover:text-[#1b50d8] transition-colors"
                ></Link>
                <Link
                    target="_blank"
                    href={"https://instagram.com/uxphofficial/"}
                    className="icon-[fa-brands--instagram] hover:text-[#1b50d8] transition-colors"
                ></Link>
                <Link 
                    target="_blank" 
                    href={"https://x.com/uxphofficial/"} 
                    className="icon-[fa-brands--twitter] hover:text-[#1b50d8] transition-colors"
                ></Link>
                <Link
                    target="_blank"
                    href={"https://www.linkedin.com/company/uxph"}
                    className="icon-[fa-brands--linkedin] hover:text-[#1b50d8] transition-colors"
                ></Link>
            </div>
        </div>
    );
};

export default WorkshopRegistration;
