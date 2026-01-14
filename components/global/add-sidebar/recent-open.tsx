import { Button } from '@/components/ui/button';
import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar'
import Link from 'next/link';


type Props = {
    recentProjects: {
        title: string;
        url: string;
    }[];
}

const RecentOpen = ({ recentProjects }: Props) => {
    return (
        <SidebarGroup className="p-0">
            <SidebarGroupLabel>Chamados Recentes</SidebarGroupLabel>

            <SidebarMenu className="gap-1">
                {recentProjects.length > 0 ? (
                    recentProjects.map((project, index) => (
                        <SidebarMenuItem key={index}>
                            <SidebarMenuButton
                                asChild
                                tooltip={project.title}
                                className="
                                    h-auto
                                    rounded-md
                                    bg-muted/40
                                    px-3
                                    py-2
                                    text-xs
                                    justify-start
                                    transition-colors
                                    hover:bg-muted
                                    data-[active=true]:bg-muted
                                "
                            >
                                <Link href={project.url}>
                                    <span className="truncate">
                                        {project.title}
                                    </span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))
                ) : (
                    <SidebarMenuItem>
                        <div
                            className="
                                rounded-md
                                bg-muted/30
                                px-3
                                py-2
                                text-xs
                                text-muted-foreground
                            "
                        >
                            No recent projects
                        </div>
                    </SidebarMenuItem>
                )}
            </SidebarMenu>
        </SidebarGroup>
    )
}


export default RecentOpen;