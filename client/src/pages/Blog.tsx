import React, { useState } from 'react';
import { BlogPost } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, User } from 'lucide-react';

const Blog: React.FC = () => {
  const [blogPosts] = useState<BlogPost[]>(() => {
    const stored = localStorage.getItem('blogPosts');
    return stored ? JSON.parse(stored) : [];
  });

  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-r from-primary/10 to-accent/10 border-b border-border py-8">
        <div className="container">
          <h1 className="text-4xl font-bold text-foreground">Coffee Blog</h1>
          <p className="text-muted-foreground">Discover tips, stories, and insights about coffee</p>
        </div>
      </div>

      <div className="container py-12">
        {selectedPost ? (
          <div className="max-w-3xl mx-auto">
            <Button
              onClick={() => setSelectedPost(null)}
              variant="outline"
              className="mb-8"
            >
              Back to Articles
            </Button>

            <article className="card-minimal p-8 rounded-lg">
              <img
                src={selectedPost.image}
                alt={selectedPost.title}
                className="w-full h-96 object-cover rounded-lg mb-8"
              />

              <div className="flex items-center gap-4 text-muted-foreground mb-6">
                <span className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {new Date(selectedPost.date).toLocaleDateString()}
                </span>
                <span className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  {selectedPost.author}
                </span>
              </div>

              <h1 className="text-4xl font-bold text-foreground mb-6">{selectedPost.title}</h1>
              <p className="text-lg text-foreground leading-relaxed whitespace-pre-wrap">
                {selectedPost.content}
              </p>
            </article>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogPosts.map((post) => (
              <Card
                key={post.id}
                className="card-minimal overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer"
                onClick={() => setSelectedPost(post)}
              >
                <div className="aspect-video overflow-hidden bg-muted">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(post.date).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {post.author}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-foreground mb-3">{post.title}</h2>
                  <p className="text-muted-foreground mb-4 line-clamp-3">{post.excerpt}</p>
                  <Button className="btn-primary w-full">Read More</Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Blog;
