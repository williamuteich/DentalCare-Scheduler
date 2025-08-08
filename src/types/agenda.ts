export interface Appointment {
    _id: string;
    date: string;
    time: string;
    title: string;
    completed?: boolean;
    clientId: string;
    clientName: string;
    value: number;
    note?: string;
    duration?: number;
}

export interface AgendaHeaderProps {
    currentDate: Date;
    viewMode: 'day' | 'week' | 'month';
    onNavigate: (direction: number) => void;
    onToday: () => void;
    onViewChange: (mode: 'day' | 'week' | 'month') => void;
    headerText: string;
}

export interface AppointmentCardProps {
    appointment: any;
    clients: any[];
    onComplete: (id: string) => void;
    onEdit: (appointment: any) => void;
    onDelete: (id: string) => void;
    processing: string | null;
}

export interface AppointmentFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    editingAppointment?: any;
    clients: any[];
    currentDate: Date;
    allAppointments?: any[];
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
    processing?: string | null;
}

export interface DayViewProps {
    loading: boolean;
    appointments: any[];
    clients: any[];
    onComplete: (id: string) => void;
    onEdit: (appointment: any) => void;
    onDelete: (id: string) => void;
    processing: string | null;
    searchTerm: string;
}

export interface MonthViewProps {
    loading: boolean;
    currentDate: Date;
    allAppointments: any[];
    onDayClick: (day: Date) => void;
    onAppointmentClick: (appointment: any) => void;
}

export interface SearchBarProps {
    searchTerm: string;
    onSearchChange: (term: string) => void;
    onNewAppointment: () => void;
}

export interface StatsCardsProps {
    stats: {
        total: number;
        completed: number;
        revenue: number;
    };
}

export interface WeekViewProps {
    loading: boolean;
    currentDate: Date;
    allAppointments: any[];
    onDayClick: (day: Date) => void;
    onAppointmentClick: (appointment: any) => void;
}