import { Dao } from "./Dao";

export class Thumbnail {
    id: number;
    templateId:number;
    thumbhash:string;
    pngBuffer: Buffer;
    uploadedAt: Date;

    constructor(id:number, templateId:number, thumbhash:string, pngBuffer:Buffer, uploadedAt:Date) {
        this.id = id
        this.templateId = templateId
        this.thumbhash = thumbhash
        this.pngBuffer = pngBuffer
        this.uploadedAt = uploadedAt
    }
}

export class ThumbnailDao extends Dao<Thumbnail> {
    protected tableName: string = 'thumbnails'

    public parseRow(row: any): Thumbnail {
        return new Thumbnail(
            row.id,
            row.templateId,
            row.thumbhash,
            row.pngBuffer,
            row.uploadedAt
        )
    }

    static async save(templateIdParam: number, pngBuffer: Buffer, hash: string) {
        const dao = new ThumbnailDao()
        await dao.db.query(`INSERT INTO thumbnails (template_id, thumbhash, png_data) VALUES ($1, $2, $3)`, [templateIdParam, hash, pngBuffer])
    }
}