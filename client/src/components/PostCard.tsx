import React from 'react';
import { Heart, MessageCircle, Share2, MoreHorizontal } from 'lucide-react';
import Image from 'next/image';

interface PostProps {
    post: {
        _id: string;
        content: string;
        images?: string[];
        createdAt: string;
        likes: string[];
        comments: any[];
        brand: {
            name: string;
            profilePhoto: string;
        };
    };
}

export default function PostCard({ post }: PostProps) {
    return (
        <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-6 mb-6">
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden relative">
                        <Image
                            src={post.brand.profilePhoto || '/default-avatar.png'}
                            alt={post.brand.name}
                            fill
                            className="object-cover"
                        />
                    </div>
                    <div>
                        <h3 className="font-bold text-white">{post.brand.name}</h3>
                        <p className="text-gray-400 text-xs">
                            {new Date(post.createdAt).toLocaleDateString()}
                        </p>
                    </div>
                </div>
                <button className="text-gray-400 hover:text-white">
                    <MoreHorizontal size={20} />
                </button>
            </div>

            <p className="text-gray-200 mb-4 whitespace-pre-wrap">{post.content}</p>

            {post.images && post.images.length > 0 && (
                <div className="grid gap-2 mb-4">
                    {post.images.map((img, idx) => (
                        <div key={idx} className="relative w-full h-64 rounded-lg overflow-hidden">
                            <Image src={img} alt="Post content" fill className="object-cover" />
                        </div>
                    ))}
                </div>
            )}

            <div className="flex items-center gap-6 pt-4 border-t border-white/5 text-gray-400">
                <button className="flex items-center gap-2 hover:text-pink-500 transition-colors">
                    <Heart size={20} />
                    <span>{post.likes.length}</span>
                </button>
                <button className="flex items-center gap-2 hover:text-blue-400 transition-colors">
                    <MessageCircle size={20} />
                    <span>{post.comments.length}</span>
                </button>
                <button className="flex items-center gap-2 hover:text-green-400 transition-colors ml-auto">
                    <Share2 size={20} />
                    <span>Share</span>
                </button>
            </div>
        </div>
    );
}
