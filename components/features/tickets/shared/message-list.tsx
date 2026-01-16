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
      <div className="flex items-center justify-center py-8 sm:py-12">
        <div className="text-center">
          <div className="size-10 sm:size-12 mx-auto mb-2 sm:mb-3 rounded-full bg-muted flex items-center justify-center">
            <span className="text-lg sm:text-xl">💬</span>
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
    <div className="space-y-2">
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
              "flex gap-2 sm:gap-3 group",
              isCurrentUser ? "flex-row-reverse" : "flex-row"
            )}
          >
            {/* Avatar */}
            <div className={cn("shrink-0", isCurrentUser ? "ml-1 sm:ml-2" : "mr-1 sm:mr-2")}>
              {showAvatar ? (
                <Avatar className="size-6 sm:size-8 border border-border sm:border-2">
                  <AvatarFallback className={cn(
                    "text-[10px] sm:text-xs font-semibold",
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
                <div className="size-6 sm:size-8" />
              )}
            </div>

            {/* Message Bubble */}
            <div className={cn(
              "flex flex-col max-w-[80%] sm:max-w-[75%]",
              isCurrentUser ? "items-end" : "items-start"
            )}>
              {showAvatar && (
                <span className={cn(
                  "text-[10px] sm:text-xs font-medium mb-0.5 sm:mb-1 px-1",
                  isCurrentUser ? "text-right" : "text-left"
                )}>
                  {isCurrentUser ? "Você" : message.author.name.split(' ')[0]}
                </span>
              )}
              
              <div
                className={cn(
                  "rounded-xl sm:rounded-2xl px-2.5 sm:px-3 lg:px-4 py-1.5 sm:py-2 lg:py-2.5 shadow-sm",
                  isCurrentUser
                    ? "bg-primary text-primary-foreground rounded-br-sm dark:bg-primary/80"
                    : "bg-muted text-foreground rounded-bl-sm dark:bg-muted/60"
                )}
              >
                <div
                  className={cn(
                    "text-xs sm:text-sm leading-relaxed",
                    "[&_p]:my-0.5 [&_p]:leading-relaxed",
                    "[&_ul]:my-0.5 [&_ul]:list-disc [&_ul]:ml-2 sm:[&_ul]:ml-3 [&_ul]:space-y-0.5",
                    "[&_ol]:my-0.5 [&_ol]:list-decimal [&_ol]:ml-2 sm:[&_ol]:ml-3 [&_ol]:space-y-0.5",
                    "[&_strong]:font-semibold [&_em]:italic",
                    "[&_a]:underline [&_a]:opacity-90",
                    "[&_img]:max-w-full [&_img]:max-h-[200px] sm:[&_img]:max-h-[300px] [&_img]:object-contain [&_img]:rounded-lg [&_img]:my-1 [&_img]:border [&_img]:border-border/50 [&_img]:cursor-pointer [&_img]:hover:opacity-90",
                    "[&_video]:max-w-full [&_video]:max-h-[200px] sm:[&_video]:max-h-[300px] [&_video]:rounded-lg [&_video]:my-1 [&_video]:border [&_video]:border-border/50",
                    isCurrentUser && "[&_a]:text-primary-foreground/90"
                  )}
                  dangerouslySetInnerHTML={{ __html: message.content }}
                />
              </div>

              <span className={cn(
                "text-[9px] sm:text-[10px] lg:text-xs text-muted-foreground mt-0.5 px-1",
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
