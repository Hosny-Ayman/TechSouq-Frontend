export interface ICategorie {
  data: IData[];
  PageSize: number;
  TotalRecords: number;
  TotalPages: number;
  CurrentPage: number;
}

export interface IData {
  id: number;
  name: string;
  imageUrl: string;
}
