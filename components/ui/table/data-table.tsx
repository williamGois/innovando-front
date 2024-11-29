'use client';

import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon
} from '@radix-ui/react-icons';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  PaginationState,
  useReactTable
} from '@tanstack/react-table';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { parseAsInteger, useQueryState } from 'nuqs';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  totalItems: number;
  pageSizeOptions?: number[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
  totalItems,
  pageSizeOptions = [10, 20, 30, 40, 50]
}: DataTableProps<TData, TValue>) {
  const [paginaAtual, setPaginaAtual] = useQueryState(
    'pagina',
    parseAsInteger.withOptions({ shallow: false }).withDefault(1)
  );
  const [tamanhoPagina, setTamanhoPagina] = useQueryState(
    'limite',
    parseAsInteger
      .withOptions({ shallow: false, history: 'push' })
      .withDefault(10)
  );

  const estadoPaginacao = {
    pageIndex: paginaAtual - 1, // Índice baseado em zero para o React Table
    pageSize: tamanhoPagina
  };

  const totalPaginas = Math.ceil(totalItems / tamanhoPagina);

  const alterarPaginacao = (
    valorOuAtualizador:
      | PaginationState
      | ((antigo: PaginationState) => PaginationState)
  ) => {
    const paginacao =
      typeof valorOuAtualizador === 'function'
        ? valorOuAtualizador(estadoPaginacao)
        : valorOuAtualizador;

    setPaginaAtual(paginacao.pageIndex + 1);
    setTamanhoPagina(paginacao.pageSize);
  };

  const tabela = useReactTable({
    data,
    columns,
    pageCount: totalPaginas,
    state: {
      pagination: estadoPaginacao
    },
    onPaginationChange: alterarPaginacao,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
    manualFiltering: true
  });

  return (
    <div className="space-y-4">
      <ScrollArea className="grid h-[calc(80vh-220px)] rounded-md border md:h-[calc(90dvh-240px)]">
        <Table className="relative">
          <TableHeader>
            {tabela.getHeaderGroups().map((grupoCabecalho) => (
              <TableRow key={grupoCabecalho.id}>
                {grupoCabecalho.headers.map((cabecalho) => (
                  <TableHead key={cabecalho.id}>
                    {cabecalho.isPlaceholder
                      ? null
                      : flexRender(
                          cabecalho.column.columnDef.header,
                          cabecalho.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {tabela.getRowModel().rows?.length ? (
              tabela.getRowModel().rows.map((linha) => (
                <TableRow
                  key={linha.id}
                  data-state={linha.getIsSelected() && 'selected'}
                >
                  {linha.getVisibleCells().map((celula) => (
                    <TableCell key={celula.id}>
                      {flexRender(
                        celula.column.columnDef.cell,
                        celula.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Nenhum resultado encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      <div className="flex flex-col items-center justify-end gap-2 space-x-2 py-4 sm:flex-row">
        <div className="flex w-full items-center justify-between">
          <div className="flex-1 text-sm text-muted-foreground">
            {totalItems > 0 ? (
              <>
                Mostrando{' '}
                {estadoPaginacao.pageIndex * estadoPaginacao.pageSize + 1} a{' '}
                {Math.min(
                  (estadoPaginacao.pageIndex + 1) * estadoPaginacao.pageSize,
                  totalItems
                )}{' '}
                de {totalItems} registros
              </>
            ) : (
              'Nenhum registro encontrado'
            )}
          </div>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-6 lg:gap-8">
            <div className="flex items-center space-x-2">
              <p className="whitespace-nowrap text-sm font-medium">
                Linhas por página
              </p>
              <Select
                value={`${estadoPaginacao.pageSize}`}
                onValueChange={(valor) => {
                  tabela.setPageSize(Number(valor));
                }}
              >
                <SelectTrigger className="h-8 w-[70px]">
                  <SelectValue placeholder={estadoPaginacao.pageSize} />
                </SelectTrigger>
                <SelectContent side="top">
                  {pageSizeOptions.map((tamanhoPagina) => (
                    <SelectItem key={tamanhoPagina} value={`${tamanhoPagina}`}>
                      {tamanhoPagina}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <div className="flex w-full items-center justify-between gap-2 sm:justify-end">
          <div className="flex w-[150px] items-center justify-center text-sm font-medium">
            {totalItems > 0 ? (
              <>
                Página {estadoPaginacao.pageIndex + 1} de {tabela.getPageCount()}
              </>
            ) : (
              'Sem páginas'
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              aria-label="Ir para a primeira página"
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => tabela.setPageIndex(0)}
              disabled={!tabela.getCanPreviousPage()}
            >
              <DoubleArrowLeftIcon className="h-4 w-4" aria-hidden="true" />
            </Button>
            <Button
              aria-label="Ir para a página anterior"
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => tabela.previousPage()}
              disabled={!tabela.getCanPreviousPage()}
            >
              <ChevronLeftIcon className="h-4 w-4" aria-hidden="true" />
            </Button>
            <Button
              aria-label="Ir para a próxima página"
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => tabela.nextPage()}
              disabled={!tabela.getCanNextPage()}
            >
              <ChevronRightIcon className="h-4 w-4" aria-hidden="true" />
            </Button>
            <Button
              aria-label="Ir para a última página"
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => tabela.setPageIndex(tabela.getPageCount() - 1)}
              disabled={!tabela.getCanNextPage()}
            >
              <DoubleArrowRightIcon className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
