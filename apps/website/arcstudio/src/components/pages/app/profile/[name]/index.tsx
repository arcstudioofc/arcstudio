

export default function ProfileName({ user }: { user: ILeanUser }) {
  return (
    <div className="flex items-center gap-2">
      {user.image && (
        <img
          src={user.image}
          alt={user.name!}
          className="w-8 h-8 rounded-full"
        />
      )}
      <span>bem vindo ao perfil {user.name}</span>
    </div>
  );
}
