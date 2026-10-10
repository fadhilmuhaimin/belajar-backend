// Diagram arsitektur tahap di atas React Flow (I4, keputusan 232).
// - Sebelum JS dimuat dan untuk pembaca layar selalu ada versi statis (role="img" + aria-label).
// - Diagram tidak bisa digeser, di-zoom, atau menangkap scroll halaman; ukurannya dari fitView (zoom paling besar 1).
// - Kotak adalah tombol: klik atau Enter membuka catatannya di bawah diagram, bukan tooltip.
// Dimuat hanya di halaman yang memakainya, dengan client:visible.
import { useEffect, useMemo, useRef, useState } from "react";
import { Handle, MarkerType, Position, ReactFlow, type Edge, type Node, type NodeProps } from "@xyflow/react";
import "@xyflow/react/dist/base.css";
import "./diagram.css";
import type { Arsitektur } from "./skema";
import { LABEL_STATUS, UKURAN, deskripsi, lebarMendatar, tata, type Arah, type Status, type TataKotak } from "./tata";

type DataKotak = { t: TataKotak; arah: Arah; dipilih: boolean; pilih: (id: string) => void; idCatatan: string };
type DataZona = { label: string };

function NodeKotak({ data }: NodeProps<Node<DataKotak>>) {
  const { t, arah, dipilih, pilih } = data;
  const [masuk, keluar] = arah === "mendatar" ? [Position.Left, Position.Right] : [Position.Top, Position.Bottom];
  return (
    <>
      <Handle type="target" position={masuk} isConnectable={false} />
      <button
        type="button"
        className={`diagram__kotak is-${t.status}`}
        aria-pressed={dipilih}
        aria-controls={data.idCatatan}
        onClick={() => pilih(t.id)}
      >
        <span className="diagram__label">{t.kotak.label}</span>
        <span className="diagram__status">{LABEL_STATUS[t.status]}</span>
      </button>
      <Handle type="source" position={keluar} isConnectable={false} />
    </>
  );
}

function NodeZona({ data }: NodeProps<Node<DataZona>>) {
  return <span className="diagram__zona-label">{data.label}</span>;
}

const jenisNode = { kotak: NodeKotak, zona: NodeZona };

// Kalimat di panel catatan saat kotak tanpa catatan dipilih.
const KALIMAT_STATUS: Record<Status, string> = {
  baru: "Baru di tahap ini.",
  berubah: "Sudah ada sebelumnya; isinya berubah di tahap ini.",
  lama: "Sudah ada sejak tahap sebelumnya.",
};

type Props = { data: Arsitektur; judul: string; id: string };

export default function DiagramArsitektur({ data, judul, id }: Props) {
  const wadah = useRef<HTMLDivElement>(null);
  const [lebar, setLebar] = useState<number | null>(null); // null = belum di-hydrate: tampilkan versi statis
  const [pilihan, setPilihan] = useState<string | null>(null);

  useEffect(() => {
    const el = wadah.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setLebar(Math.round(e.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const arah: Arah = lebar !== null && lebar < lebarMendatar(data) ? "tegak" : "mendatar";
  const hasil = useMemo(() => tata(data, arah), [data, arah]);
  const teks = useMemo(() => deskripsi(data, judul), [data, judul]);
  const pilih = (k: string) => setPilihan((p) => (p === k ? null : k));
  const idCatatan = `${id}-catatan`;

  const nodes: Node[] = [
    ...hasil.zona.map((z) => ({
      id: z.id,
      type: "zona",
      position: { x: z.x, y: z.y },
      width: z.lebar,
      height: z.tinggi,
      data: { label: z.label },
      className: "diagram__zona",
      selectable: false,
      focusable: false,
      zIndex: 0,
    })),
    ...hasil.kotak.map((t) => ({
      id: t.id,
      type: "kotak",
      position: { x: t.x, y: t.y },
      width: UKURAN.lebar,
      height: UKURAN.tinggi,
      data: { t, arah, dipilih: pilihan === t.id, pilih, idCatatan },
      selectable: false,
      focusable: false,
      zIndex: 1,
    })),
  ];
  const edges: Edge[] = hasil.panah.map((p) => ({
    id: p.id,
    source: p.dari,
    target: p.ke,
    type: "straight",
    focusable: false,
    selectable: false,
    markerEnd: { type: MarkerType.ArrowClosed, color: "currentColor", width: 16, height: 16 },
  }));
  const terpilih = hasil.kotak.find((t) => t.id === pilihan);
  // Tinggi wadah = tinggi tata pada zoom 1 + bantalan fitView; lebar mengikuti kolom.
  const tinggi = hasil.tinggi + 24;

  return (
    <figure className="diagram not-content" data-diagram={id} data-arah={lebar === null ? "statis" : arah}>
      {/* Versi statis: terlihat sebelum JS, tetap ada untuk pembaca layar sesudahnya. */}
      <div role="img" aria-label={teks} className={lebar === null ? "diagram__statis" : "diagram__statis sr-only"}>
        {data.baris.map((b, r) => (
          <ol key={r} className="diagram__statis-baris" aria-hidden="true">
            {b.map((k, i) => (
              <li key={i} className={`is-${k.baru ? "baru" : k.berubah ? "berubah" : "lama"}${k.lepas ? " is-lepas" : ""}`}>
                {k.label}
              </li>
            ))}
          </ol>
        ))}
      </div>
      <div ref={wadah} className="diagram__wadah" style={lebar === null ? undefined : { height: tinggi }}>
        {lebar !== null && (
          <ReactFlow
            key={arah}
            id={id}
            nodes={nodes}
            edges={edges}
            nodeTypes={jenisNode}
            fitView
            fitViewOptions={{ padding: 0.04, maxZoom: 1, minZoom: 0.5 }}
            minZoom={0.5}
            maxZoom={1}
            nodesDraggable={false}
            nodesConnectable={false}
            nodesFocusable={false}
            edgesFocusable={false}
            elementsSelectable={false}
            panOnDrag={false}
            panOnScroll={false}
            zoomOnScroll={false}
            zoomOnPinch={false}
            zoomOnDoubleClick={false}
            preventScrolling={false}
            disableKeyboardA11y
            proOptions={{ hideAttribution: true }}
          />
        )}
      </div>
      <div id={idCatatan} className="diagram__catatan" aria-live="polite">
        {terpilih ? (
          <p>
            <strong>{terpilih.kotak.label}.</strong> {terpilih.kotak.catatan ?? KALIMAT_STATUS[terpilih.status]}
          </p>
        ) : lebar !== null ? (
          <p className="diagram__petunjuk">Pilih kotak untuk membaca catatannya.</p>
        ) : null}
      </div>
      {data.caption && <figcaption>{data.caption}</figcaption>}
    </figure>
  );
}
