import { TrilhasPostListItem } from "@/lib/trilhas/type"
import PostCard from "./PostCard"

export default function PostsList({ posts }: { posts: TrilhasPostListItem[] }) {
    return (
        <div className="space-y-6">
            {posts.length === 0 ? (
                <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-black/5">
                    <p className="text-sm text-slate-600">Nenhum resultado encontrado.</p>
                </div>
            ) : (
                posts.map((p) => <PostCard key={p.id} post={p} />)
            )}
        </div>
    )
}
