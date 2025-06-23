
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tournament } from '@/types/tournament';
import { TournamentCard } from './TournamentCard';

interface TournamentTableProps {
  tournaments: Tournament[];
  onEdit: (tournament: Tournament) => void;
  onDelete: (id: string) => void;
}

export const TournamentTable = ({ tournaments, onEdit, onDelete }: TournamentTableProps) => {
  if (tournaments.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400 mb-4">Nenhum torneio cadastrado ainda.</p>
        <p className="text-sm text-gray-500">
          Comece criando torneios para cada dia da semana.
        </p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="text-poker-gold">Nome</TableHead>
          <TableHead className="text-poker-gold">Dia</TableHead>
          <TableHead className="text-poker-gold">Data</TableHead>
          <TableHead className="text-poker-gold">Horário</TableHead>
          <TableHead className="text-poker-gold">Buy-in</TableHead>
          <TableHead className="text-poker-gold">Prêmio</TableHead>
          <TableHead className="text-poker-gold">Jogadores</TableHead>
          <TableHead className="text-poker-gold">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tournaments.map((tournament) => (
          <TournamentCard
            key={tournament.id}
            tournament={tournament}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </TableBody>
    </Table>
  );
};
