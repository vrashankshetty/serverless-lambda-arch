
import functionApi from '@/api';
import { useQuery } from '@tanstack/react-query';



export function useQueryDashboard() {
    const query = useQuery({
      queryKey: [`getDashboard`],
      queryFn: () => functionApi.getDashboard(),
    });
    return query;
  }

  


export function useQueryFunctions() {
  const query = useQuery({
    queryKey: [`getFunctions`],
    queryFn: () => functionApi.getAll(),
  });
  return query;
}


export function useQueryFunctionExecution(id:string) {
  const query = useQuery({
    queryKey: [`getFunctionExecution${id}`],
    queryFn: () => functionApi.getExecutions(id)
  });
  return query;
}



export function useQueryExecutions() {
  const query = useQuery({
    queryKey: [`getExecutions`],
    queryFn: () => functionApi.getAllExecutions(),
  });
  return query;
}



export function useQueryEachExecution(id:string) {
  const query = useQuery({
    queryKey: [`getExecutions${id}`],
    queryFn: () => functionApi.getEachExecution(id),
  });
  return query;
}



export function useQueryEachFunction(id:string) {
  const query = useQuery({
    queryKey: [`getFuncion${id}`],
    queryFn: () => functionApi.getEachFunction(id),
  });
  return query;
}
