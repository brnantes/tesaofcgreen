
import { Button } from '@/components/ui/button';
import { TableCell, TableRow } from '@/components/ui/table';
import { Tournament } from '@/types/tournament';
import { Trash2, Edit } from 'lucide-react';

interface TournamentCardProps {
  tournament: Tournament;
  onEdit: (tournament: Tournament) => void;
  onDelete: (id: string) => void;
}

export const TournamentCard = ({ tournament, onEdit, onDelete }: TournamentCardProps) => {
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR');
    } catch (error) {
      return dateString;
    }
  };

  const getDayOfWeek = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
      return days[date.getDay()];
    } catch (error) {
      return '-';
    }
  };

  const handleDelete = () => {
    if (confirm('Tem certeza que deseja deletar este torneio?')) {
      console.log('🗑️ Deletando torneio:', tournament.id);
      onDelete(tournament.id);
    }
  };

  const handleEdit = () => {
    console.log('✏️ Editando torneio:', tournament);
    onEdit(tournament);
  };

  return (
    <TableRow>
      <TableCell className="text-white font-medium">{tournament.name}</TableCell>
      <TableCell className="text-poker-gold">{getDayOfWeek(tournament.date)}</TableCell>
      <TableCell className="text-gray-300">{formatDate(tournament.date)}</TableCell>
      <TableCell className="text-gray-300">{tournament.time}</TableCell>
      <TableCell className="text-poker-gold">{tournament.buy_in}</TableCell>
      <TableCell className="text-poker-gold font-semibold">{tournament.prize}</TableCell>
      <TableCell className="text-gray-300">{tournament.max_players}</TableCell>
      <TableCell>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleEdit}
            className="border-poker-gold/30 text-poker-gold hover:bg-poker-gold/10"
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            className="border-red-500/30 text-red-500 hover:bg-red-500/10"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};
