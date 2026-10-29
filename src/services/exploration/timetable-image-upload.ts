import { File } from 'expo-file-system';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { Platform } from 'react-native';

import { TimetableError } from './schedule-analysis-errors';

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

function validateSize(size: number) {
  if (!size) throw new TimetableError('사진 파일이 비어 있어요. 시간표 사진을 다시 선택해 주세요.');
  if (size > MAX_UPLOAD_BYTES) {
    throw new TimetableError('사진 용량이 너무 커요. 10MB 이하의 시간표 사진을 선택해 주세요.');
  }
}

export async function createTimetableFormData(imageUri: string, signal?: AbortSignal): Promise<FormData> {
  const formData = new FormData();

  if (Platform.OS === 'web') {
    const response = await fetch(imageUri, { signal });
    if (!response.ok) throw new TimetableError('선택한 사진을 열지 못했어요. 사진을 다시 선택해 주세요.');
    const blob = await response.blob();
    validateSize(blob.size);
    if (blob.type !== 'image/png' && blob.type !== 'image/jpeg') {
      throw new TimetableError('PNG 또는 JPG 형식의 시간표 사진을 선택해 주세요.');
    }
    formData.append('file', blob, blob.type === 'image/png' ? 'timetable.png' : 'timetable.jpg');
    return formData;
  }

  let file = new File(imageUri);
  if (!file.exists) throw new TimetableError('선택한 사진을 열지 못했어요. 사진을 다시 선택해 주세요.');
  validateSize(file.size);

  // Keep PNG/JPEG screenshots intact. Convert HEIC and other picker formats to a real JPEG.
  if (file.type !== 'image/png' && file.type !== 'image/jpeg') {
    const context = ImageManipulator.manipulate(imageUri);
    try {
      const image = await context.renderAsync();
      try {
        const converted = await image.saveAsync({ format: SaveFormat.JPEG, compress: 1 });
        file = new File(converted.uri);
      } finally {
        image.release();
      }
    } finally {
      context.release();
    }
    validateSize(file.size);
  }

  // Expo fetch consumes File.bytes(); a legacy { uri, name, type } object is not a file body.
  formData.append('file', file);
  return formData;
}
