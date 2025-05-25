import { Calendar, Home, Inbox, Settings, UserRoundPlus } from 'lucide-react';

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';

const items = [
    {
        title: 'Home',
        url: '/',
        icon: Home,
    },
    {
        title: 'Add Patient',
        url: '/add/patient',
        icon: UserRoundPlus,
    },
    {
        title: 'Add Doctor',
        url: '/add/doctor',
        icon: UserRoundPlus,
    },
    {
        title: 'Schedule Appointment',
        url: '/schedule',
        icon: Calendar,
    },
    // {
    //     title: 'Settings',
    //     url: '/settings',
    //     icon: Settings,
    // },
];

export function AppSidebar() {
    return (
        <Sidebar>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>
                        <h1 className="text-lg font-semibold">Patient Registration</h1>
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map((item, index) => (
                                <SidebarMenuItem key={index}>
                                    <SidebarMenuButton asChild>
                                        <a href={item.url}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </a>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    );
}
