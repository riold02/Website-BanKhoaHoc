import { apiClient } from './api.client';

const downloadBlob = async (url: string, filename: string) => {
  const response = await apiClient.get(url, { responseType: 'blob' });
  const contentTypeHeader = response.headers['content-type'];
  const contentType = Array.isArray(contentTypeHeader)
    ? contentTypeHeader[0]
    : typeof contentTypeHeader === 'string'
      ? contentTypeHeader
      : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

  const blob = new Blob([response.data], {
    type: contentType,
  });

  const downloadUrl = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = downloadUrl;
  anchor.download = filename;
  anchor.click();
  window.URL.revokeObjectURL(downloadUrl);
};

export const exportApi = {
  async exportClassList() {
    await downloadBlob('/exports/classes', 'danh-sach-lop.xlsx');
  },

  async exportGrades(classId?: string) {
    const url = classId ? `/exports/grades?classId=${encodeURIComponent(classId)}` : '/exports/grades';
    await downloadBlob(url, 'bang-diem.xlsx');
  },

  async exportTuitionReport() {
    await downloadBlob('/exports/tuition-report', 'bao-cao-hoc-phi.xlsx');
  },
};
