'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import PartyBackground from '@/components/PartyBackground';
import { Button, Input } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/Toast';

const categories = ['party', 'concert', 'wedding', 'corporate', 'birthday', 'festival', 'other'];

export default function CreateEventPage() {
    const router = useRouter();
    const { isAuthenticated, isLoading } = useAuth();
    const { showToast } = useToast();
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category: 'party',
        date: '',
        startTime: '',
        endTime: '',
        venueId: '',
        venueName: '',
        eventType: 'public' as 'public' | 'private',
        ticketType: 'free' as 'free' | 'paid',
        ticketPrice: 0,
        maxAttendees: 100,
    });

    useEffect(() => {
        // Only redirect if auth check is complete AND user is not authenticated
        if (!isLoading && !isAuthenticated) {
            router.replace('/signin');
        }
    }, [isLoading, isAuthenticated, router]);

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));
            showToast('Event created successfully!', 'success');
            router.push('/dashboard/events');
        } catch {
            showToast('Failed to create event', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Show loading only while isLoading is true
    if (isLoading) {
        return (
            <>
                <PartyBackground />
                <Navbar />
                <main className="min-h-screen flex items-center justify-center">
                    <div className="animate-spin w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full" />
                </main>
            </>
        );
    }

    // If not authenticated after loading, return null (redirect will happen)
    if (!isAuthenticated) {
        return null;
    }

    return (
        <>
            <PartyBackground />
            <Navbar />

            <main className="relative z-20 min-h-screen pt-28 pb-16 px-4">
                <div className="max-w-2xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Create Event</h1>
                        <p className="text-gray-400">Fill in the details to create your event</p>
                    </div>

                    {/* Progress Steps */}
                    <div className="flex items-center justify-center gap-2 mb-8">
                        {[1, 2, 3].map((s) => (
                            <div key={s} className="flex items-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${step >= s ? 'bg-violet-500 text-white' : 'bg-white/10 text-gray-500'
                                    }`}>
                                    {s}
                                </div>
                                {s < 3 && (
                                    <div className={`w-12 h-0.5 mx-2 ${step > s ? 'bg-violet-500' : 'bg-white/10'}`} />
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Form Card */}
                    <div className="bg-white/[0.02] backdrop-blur-xl border border-white/[0.05] rounded-2xl p-8">
                        {/* Step 1: Basic Info */}
                        {step === 1 && (
                            <div className="space-y-6">
                                <h2 className="text-xl font-semibold text-white mb-4">Basic Information</h2>

                                <Input
                                    label="Event Name"
                                    placeholder="e.g., Neon Nights Festival"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                                    <textarea
                                        placeholder="Describe your event..."
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        rows={4}
                                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                                    <div className="flex flex-wrap gap-2">
                                        {categories.map((cat) => (
                                            <button
                                                key={cat}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, category: cat })}
                                                className={`px-4 py-2 rounded-full text-sm capitalize transition-all ${formData.category === cat
                                                    ? 'bg-violet-500 text-white'
                                                    : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-white/10'
                                                    }`}
                                            >
                                                {cat}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex justify-end">
                                    <Button onClick={() => setStep(2)}>Next</Button>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Date, Time & Venue */}
                        {step === 2 && (
                            <div className="space-y-6">
                                <h2 className="text-xl font-semibold text-white mb-4">Date, Time & Venue</h2>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Date</label>
                                    <input
                                        type="date"
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Start Time</label>
                                        <input
                                            type="time"
                                            value={formData.startTime}
                                            onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">End Time</label>
                                        <input
                                            type="time"
                                            value={formData.endTime}
                                            onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                                        />
                                    </div>
                                </div>

                                <Input
                                    label="Venue Name"
                                    placeholder="Select or enter venue name"
                                    value={formData.venueName}
                                    onChange={(e) => setFormData({ ...formData, venueName: e.target.value })}
                                    helperText="You can book a venue from our listings or enter a custom location"
                                />

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Maximum Attendees</label>
                                    <input
                                        type="number"
                                        min={1}
                                        value={formData.maxAttendees}
                                        onChange={(e) => setFormData({ ...formData, maxAttendees: parseInt(e.target.value) })}
                                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                                    />
                                </div>

                                <div className="flex justify-between">
                                    <Button variant="secondary" onClick={() => setStep(1)}>Back</Button>
                                    <Button onClick={() => setStep(3)}>Next</Button>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Tickets & Privacy */}
                        {step === 3 && (
                            <div className="space-y-6">
                                <h2 className="text-xl font-semibold text-white mb-4">Tickets & Privacy</h2>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-3">Event Type</label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, eventType: 'public' })}
                                            className={`p-4 rounded-xl border text-left transition-all ${formData.eventType === 'public'
                                                ? 'bg-violet-500/10 border-violet-500/50 text-white'
                                                : 'bg-white/5 border-white/10 text-gray-400'
                                                }`}
                                        >
                                            <div className="font-medium mb-1">Public</div>
                                            <div className="text-xs text-gray-500">Anyone can discover & join</div>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, eventType: 'private' })}
                                            className={`p-4 rounded-xl border text-left transition-all ${formData.eventType === 'private'
                                                ? 'bg-violet-500/10 border-violet-500/50 text-white'
                                                : 'bg-white/5 border-white/10 text-gray-400'
                                                }`}
                                        >
                                            <div className="font-medium mb-1">Private</div>
                                            <div className="text-xs text-gray-500">Invite only with access code</div>
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-3">Ticket Type</label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, ticketType: 'free', ticketPrice: 0 })}
                                            className={`p-4 rounded-xl border text-left transition-all ${formData.ticketType === 'free'
                                                ? 'bg-green-500/10 border-green-500/50 text-white'
                                                : 'bg-white/5 border-white/10 text-gray-400'
                                                }`}
                                        >
                                            <div className="font-medium mb-1">Free</div>
                                            <div className="text-xs text-gray-500">No ticket required</div>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, ticketType: 'paid' })}
                                            className={`p-4 rounded-xl border text-left transition-all ${formData.ticketType === 'paid'
                                                ? 'bg-green-500/10 border-green-500/50 text-white'
                                                : 'bg-white/5 border-white/10 text-gray-400'
                                                }`}
                                        >
                                            <div className="font-medium mb-1">Paid</div>
                                            <div className="text-xs text-gray-500">Set your ticket price</div>
                                        </button>
                                    </div>
                                </div>

                                {formData.ticketType === 'paid' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Ticket Price (₹)</label>
                                        <input
                                            type="number"
                                            min={0}
                                            value={formData.ticketPrice}
                                            onChange={(e) => setFormData({ ...formData, ticketPrice: parseInt(e.target.value) })}
                                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                                        />
                                    </div>
                                )}

                                <div className="flex justify-between pt-4">
                                    <Button variant="secondary" onClick={() => setStep(2)}>Back</Button>
                                    <Button onClick={handleSubmit} isLoading={isSubmitting}>Create Event</Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </>
    );
}
