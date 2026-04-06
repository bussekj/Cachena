
interface User {
  id: string;
  name: string;
  role: string;
  email?: string; // Optional property
  readonly createdAt: Date; // Cannot be modified after initialization
}
interface TUO {
  id: string;
  name: string;
  status: string; // e.g., "Available", "Assigned to Worker X"
  tags: string[];
}


export {User, TUO}
