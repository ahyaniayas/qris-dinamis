import { NextResponse } from 'next/server';

function parseQRIS(payload: string) {
  let index = 0;
  const tags = [];
  while (index < payload.length) {
    const tag = payload.substring(index, index + 2);
    const lengthStr = payload.substring(index + 2, index + 4);
    const length = parseInt(lengthStr, 10);
    const value = payload.substring(index + 4, index + 4 + length);
    tags.push({ tag, lengthStr, value });
    index += 4 + length;
  }
  return tags;
}

function generateCRC16(payload: string) {
  let crc = 0xFFFF;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) > 0) {
        crc = (crc << 1) ^ 0x1021;
      } else {
        crc = (crc << 1);
      }
    }
  }
  crc &= 0xFFFF;
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { payload, amount } = body;

    if (!payload || !amount) {
      return NextResponse.json({ error: 'Payload and amount are required' }, { status: 400 });
    }

    // Basic validation
    if (!payload.startsWith('000201')) {
      return NextResponse.json({ error: 'Invalid QRIS payload' }, { status: 400 });
    }

    const tags = parseQRIS(payload);
    
    // Check if it's static (010211)
    const tag01 = tags.find(t => t.tag === '01');
    if (!tag01 || tag01.value !== '11') {
      return NextResponse.json({ error: 'QRIS is not a static QRIS or missing tag 01' }, { status: 400 });
    }

    // Change to Dynamic
    tag01.value = '12';

    // Insert or update Tag 54 (Amount)
    const amtStr = amount.toString();
    const amtLen = amtStr.length.toString().padStart(2, '0');
    
    const tag54Index = tags.findIndex(t => t.tag === '54');
    if (tag54Index !== -1) {
      tags[tag54Index] = { tag: '54', lengthStr: amtLen, value: amtStr };
    } else {
      // Find where to insert (before tag 63)
      const tag63Index = tags.findIndex(t => t.tag === '63');
      if (tag63Index !== -1) {
        tags.splice(tag63Index, 0, { tag: '54', lengthStr: amtLen, value: amtStr });
      } else {
        tags.push({ tag: '54', lengthStr: amtLen, value: amtStr });
      }
    }

    // Rebuild payload without CRC value
    let newPayload = '';
    for (const t of tags) {
      if (t.tag !== '63') {
        newPayload += `${t.tag}${t.lengthStr}${t.value}`;
      }
    }

    // Add Tag 63 with length 04
    newPayload += '6304';

    // Calculate new CRC
    const newCrc = generateCRC16(newPayload);

    // Final payload
    const finalPayload = newPayload + newCrc;

    return NextResponse.json({ success: true, payload: finalPayload });

  } catch (error) {
    console.error('Error converting QRIS:', error);
    return NextResponse.json({ error: 'Failed to process QRIS' }, { status: 500 });
  }
}
