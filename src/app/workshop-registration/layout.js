import Image from "next/image";
import Link from "next/link";

export default function WorkshopRegistrationLayout({ children }) {
    return (
        <div className="flex w-full min-h-screen bg-[#FEFCF6] text-gray-800 justify-center items-center flex-col py-8 px-4">
            <div className="flex items-center w-24 md:w-32 h-24 md:h-32 relative mb-6">
                <Image alt="UXPH Vertical Logo" src={"/uxph_vertical.svg"} fill={true} className="object-contain" />
            </div>
            
            {children}

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
}
