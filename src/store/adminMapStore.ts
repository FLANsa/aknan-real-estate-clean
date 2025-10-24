import { create } from 'zustand';

type Mode = 'idle'|'draw'|'edit';
type Bounds = [[number,number],[number,number]]; // SW, NE

interface AdminMapState {
  mode: Mode;
  activeProjectId?: string|null;
  selectedParcelId?: string|null;
  mapBounds?: Bounds;
  setMode: (m:Mode)=>void;
  setActiveProject: (id:string|null)=>void;
  setSelectedParcel: (id:string|null)=>void;
  setMapBounds: (b:Bounds)=>void;
}

export const useAdminMapStore = create<AdminMapState>((set)=>({
  mode:'idle',
  activeProjectId:null,
  selectedParcelId:null,
  mapBounds: undefined,
  setMode:(m)=>set({mode:m}),
  setActiveProject:(id)=>set({activeProjectId:id}),
  setSelectedParcel:(id)=>set({selectedParcelId:id}),
  setMapBounds:(b)=>set({mapBounds:b}),
}));

