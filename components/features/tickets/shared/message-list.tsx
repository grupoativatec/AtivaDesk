"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { formatDistanceToNow, format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

type Message = {
  id: string
  content: string
  createdAt: string | Date
  author: {
    id: string
    name: string
    email: string
  }
}

interface MessageListProps {
  messages: Message[]
  currentUserId: string
}

export function MessageList({ messages, currentUserId }: MessageListProps) {
  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full min-h-[200px]">
        <div className="text-center">
          <div className="size-12 mx-auto mb-3 rounded-full bg-muted flex items-center justify-center">
            <span className="text-xl">💬</span>
          </div>
          <p className="text-muted-foreground text-sm sm:text-base">
            Nenhum comentário ainda
          </p>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Seja o primeiro a comentar!
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2 sm:space-y-3">
      {messages.map((message, index) => {
        const isCurrentUser = message.author.id === currentUserId
        const messageDate = new Date(message.createdAt)
        const timeAgo = formatDistanceToNow(messageDate, {
          addSuffix: true,
          locale: ptBR,
        })
        const showAvatar = index === 0 || messages[index - 1].author.id !== message.author.id

        return (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.2, delay: index * 0.02 }}
            className={cn(
              "flex gap-3 group",
              isCurrentUser ? "flex-row-reverse" : "flex-row"
            )}
          >
            {/* Avatar */}
            <div className={cn("shrink-0", isCurrentUser ? "ml-2" : "mr-2")}>
              {showAvatar ? (
                <Avatar className="size-8 border-2 border-border">
                  <AvatarFallback className={cn(
                    "text-xs font-semibold",
                    isCurrentUser 
                      ? "bg-primary/10 text-primary" 
                      : "bg-muted text-muted-foreground"
                  )}>
                    {message.author.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .substring(0, 2)}
                  </AvatarFallback>
                </Avatar>
              ) : (
                <div className="size-8" />
              )}
            </div>

            {/* Message Bubble */}
            <div className={cn(
              "flex flex-col max-w-[85%] sm:max-w-[75%]",
              isCurrentUser ? "items-end" : "items-start"
            )}>
              {showAvatar && (
                <span className={cn(
                  "text-xs font-medium mb-1 px-1",
                  isCurrentUser ? "text-right" : "text-left"
                )}>
                  {isCurrentUser ? "Você" : message.author.name}
                </span>
              )}
              
              <div
                className={cn(
                  "rounded-2xl px-3 sm:px-4 py-2 sm:py-2.5 shadow-sm",
                  isCurrentUser
                    ? "bg-primary text-primary-foreground rounded-br-sm"
                    : "bg-muted text-foreground rounded-bl-sm"
                )}
              >
                <div
                  className={cn(
                    "text-xs sm:text-sm leading-relaxed",
                    "[&_p]:my-0.5 [&_p]:leading-relaxed",
                    "[&_ul]:my-0.5 [&_ul]:list-disc [&_ul]:ml-3 [&_ul]:space-y-0.5",
                    "[&_ol]:my-0.5 [&_ol]:list-decimal [&_ol]:ml-3 [&_ol]:space-y-0.5",
                    "[&_strong]:font-semibold [&_em]:italic",
                    "[&_a]:underline [&_a]:opacity-90",
                    "[&_img]:max-w-full [&_img]:rounded-lg [&_img]:my-1.5 [&_img]:border [&_img]:border-border/50",
                    isCurrentUser && "[&_a]:text-primary-foreground/90"
                  )}
                  dangerouslySetInnerHTML={{ __html: message.content }}
                />
              </div>

              <span className={cn(
                "text-[10px] sm:text-xs text-muted-foreground mt-0.5 px-1",
                isCurrentUser ? "text-right" : "text-left"
              )}>
                {format(messageDate, "HH:mm", { locale: ptBR })}
              </span>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
