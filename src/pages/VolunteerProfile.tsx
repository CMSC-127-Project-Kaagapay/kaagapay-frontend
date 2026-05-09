import React, { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import {
  User,
  Mail,
  Camera,
  Save,
  CheckCircle,
  Loader2,
  AtSign,
  Shield,
  ArrowLeft,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  getVolunteerProfile,
  getProfileImageUploadUrl,
  updateVolunteer,
  VolunteerResponseDto,
  VolunteerUpdateDto,
} from "@/src/lib/api";
import { supabase } from "@/src/lib/supabase";

export default function VolunteerProfile() {
  const [profile, setProfile] = useState<VolunteerResponseDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<VolunteerUpdateDto>({
    first_name: "",
    last_name: "",
    public_alias: "",
    external_handle: "",
  });

  useEffect(() => {
    async function fetchProfile() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const data = await getVolunteerProfile(user.id);
          setProfile(data);
          setFormData({
            first_name: data.first_name,
            last_name: data.last_name,
            public_alias: data.public_alias,
            external_handle: data.external_handle,
          });
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      // 1. Get presigned URL
      const { upload_url, key } = await getProfileImageUploadUrl();

      // 2. Upload to S3
      const uploadResponse = await fetch(upload_url, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      if (!uploadResponse.ok) throw new Error("Upload failed");

      // 3. Update profile with new key
      const { data: { session } } = await supabase.auth.getSession();
      if (session && profile) {
        const updated = await updateVolunteer(profile.id, { profile_image_key: key }, session.access_token);
        setProfile(updated);
        alert("Profile image updated successfully!");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Failed to upload image.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    try {
      setSaving(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const updated = await updateVolunteer(profile.id, formData, session.access_token);
        setProfile(updated);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  return (
    <div className="pt-32 pb-24 px-6 max-w-4xl mx-auto space-y-12">
      {/* Back to Dashboard */}
      <Link
        to="/volunteer/dashboard"
        className="inline-flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors font-bold text-sm uppercase tracking-widest"
      >
        <ArrowLeft size={16} />
        Back to Dashboard
      </Link>

      <div className="flex flex-col md:flex-row items-center gap-12">
        {/* Profile Image Section */}
        <div className="relative group">
          <div className="w-48 h-48 rounded-[3rem] overflow-hidden bg-surface-container border-4 border-surface shadow-2xl relative">
            {profile?.profile_image_url ? (
              <img
                src={profile.profile_image_url}
                alt="Profile"
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-on-surface-variant opacity-20">
                <User size={80} />
              </div>
            )}
            
            {uploading && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <Loader2 className="animate-spin text-white" />
              </div>
            )}
          </div>
          
          <button
            onClick={() => fileInputRef.current?.click()}
            className="absolute -bottom-4 -right-4 p-4 bg-primary text-on-primary rounded-2xl shadow-xl hover:scale-110 transition-transform active:scale-95"
            disabled={uploading}
          >
            <Camera size={24} />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            className="hidden"
            accept="image/*"
          />
        </div>

        <div className="flex-1 text-center md:text-left space-y-2">
          <h1 className="text-4xl font-black font-headline text-primary tracking-tight">
            {profile?.first_name} {profile?.last_name}
          </h1>
          <p className="text-on-surface-variant font-bold flex items-center justify-center md:justify-start gap-2 uppercase tracking-widest text-xs">
            <Shield size={14} className="text-primary" />
            Verified Kaagapay Volunteer
          </p>
          <div className="pt-4 flex flex-wrap justify-center md:justify-start gap-4">
             <div className="bg-secondary-container text-on-secondary-container px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2">
               Points: {profile?.incentive_points}
             </div>
             <div className="bg-surface-container px-4 py-2 rounded-xl text-sm font-bold text-on-surface-variant flex items-center gap-2 capitalize">
               Status: {profile?.status}
             </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-surface-container-lowest rounded-[2.5rem] p-8 md:p-12 editorial-shadow border border-outline-variant/10 space-y-8">
        <h2 className="text-2xl font-bold font-headline mb-8 border-b border-outline-variant/10 pb-6">Account Settings</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest ml-1">First Name</label>
            <input
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleInputChange}
              className="w-full bg-surface-container rounded-2xl p-4 border border-outline-variant/10 focus:border-primary outline-none font-bold transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest ml-1">Last Name</label>
            <input
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleInputChange}
              className="w-full bg-surface-container rounded-2xl p-4 border border-outline-variant/10 focus:border-primary outline-none font-bold transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest ml-1">Public Alias</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">
                <AtSign size={18} />
              </span>
              <input
                type="text"
                name="public_alias"
                value={formData.public_alias}
                onChange={handleInputChange}
                className="w-full bg-surface-container rounded-2xl p-4 pl-12 border border-outline-variant/10 focus:border-primary outline-none font-bold transition-all"
                placeholder="How you appear to victims"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest ml-1">External Contact Handle</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">
                <Mail size={18} />
              </span>
              <input
                type="text"
                name="external_handle"
                value={formData.external_handle}
                onChange={handleInputChange}
                className="w-full bg-surface-container rounded-2xl p-4 pl-12 border border-outline-variant/10 focus:border-primary outline-none font-bold transition-all"
                placeholder="Messenger / Telegram / WhatsApp"
              />
            </div>
          </div>
        </div>

        <div className="pt-8 flex items-center justify-between gap-6">
          <p className="text-xs text-on-surface-variant max-w-sm italic">
            Note: Your public alias and external handle are only shared with victims whose cases you have specifically claimed.
          </p>
          <button
            type="submit"
            disabled={saving}
            className="px-10 py-4 bg-primary text-on-primary rounded-2xl font-black text-lg flex items-center gap-3 shadow-xl shadow-primary/20 hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
          >
            {saving ? <Loader2 className="animate-spin" /> : success ? <CheckCircle /> : <Save />}
            {saving ? "Saving..." : success ? "Saved!" : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
