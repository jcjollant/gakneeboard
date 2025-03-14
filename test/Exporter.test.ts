import { describe, expect, test} from '@jest/globals';
import { Exporter } from '../backend/Exporter';
import { Template } from '../backend/models/Template';
import { TemplateView } from '../backend/models/TemplateView';

const templateData:any = [{"type":"checklist","data":{"name":"Checklist Page","items":[{"c":"a","r":"b"},{"c":"c","r":"d"}],"items2":[{"c":"e","r":"f"},{"c":"g","r":"h"}],"theme":"yellow"}},{"type":"tiles","data":[{"id":0,"name":"checklist","data":{"name":"Checklist Tile A","items":[{"c":"i","r":"j"},{"c":"k","r":"l"}],"theme":"blue"}},{"id":1,"name":"atis","data":{}},{"id":2,"name":"atis","data":{}},{"id":3,"name":"atis","data":{}},{"id":4,"name":"atis","data":{}},{"id":5,"name":"checklist","data":{"name":"Checklist Tile B","items":[{"c":"m","r":"n"},{"c":"o","r":"p"}],"theme":"blue"}}]}]

describe( 'Exporter', () => {
    test('Basic Template', async () => {
        const template:TemplateView = new TemplateView(0, 'Blank', templateData, 'Two selection pages')
        const e = await Exporter.export(template, Exporter.FORMAT_ACE)
        expect(e).toBeDefined()
        expect(e.fileName).toBe('kneeboard.ace')
        const expectedLength = 296
        expect(e.arrayBuffer.byteLength).toBe(expectedLength)
        const view = new Uint8Array(e.arrayBuffer)
        expect(view[expectedLength-4]).toBe(0xc3)
        expect(view[expectedLength-3]).toBe(0x1a)
        expect(view[expectedLength-2]).toBe(0x26)
        expect(view[expectedLength-1]).toBe(0x2e)
    })
})