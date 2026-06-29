import { Icon } from "../ui/Icon";

export default function UtilisateursSearch({ searchUser, setSearchUser }) {
  return (
    <div className="relative max-w-sm">
      <Icon name="search" className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
      <input type="text" placeholder="Rechercher un utilisateur..."
        value={searchUser} onChange={(e) => setSearchUser(e.target.value)}
        className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
      />
    </div>
  );
}
