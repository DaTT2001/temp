import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer';

// Định nghĩa font nếu cần
// Font.register({
//   family: 'Roboto',
//   src: 'https://fonts.gstatic.com/s/roboto/v20/KFOmCnqEu92Fr1Mu4mxP.ttf',
// });

const styles = StyleSheet.create({
  page: {
    padding: 20,
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  section: {
    marginBottom: 10,
  },
  title: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 10,
  },
  table: {
    display: 'table',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableColHeader: {
    width: '20%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    backgroundColor: '#e0e0e0',
    padding: 5,
  },
  tableCol: {
    width: '20%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 5,
  },
  tableCellHeader: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  tableCell: {
    fontSize: 10,
  },
});

const ReportPDF = ({ data }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Tiêu đề */}
      <View style={styles.section}>
        <Text style={styles.title}>
          Biểu ghi chép kiểm tra trong quá trình sản xuất
        </Text>
      </View>

      {/* Thông tin chung */}
      <View style={styles.section}>
        <Text>Loại lò: {data.loaiLo}</Text>
        <Text>Mã dòng chảy: {data.maDongChay}</Text>
        <Text>Ngày sản xuất: {data.ngaySanXuat}</Text>
      </View>

      {/* Thông tin sản phẩm */}
      <View style={styles.section}>
        <Text>Mã KD: {data.maKD}</Text>
        <Text>Tên sản phẩm: {data.tenSP}</Text>
        <Text>Tham số công nghệ: {data.thamSoCongNghe}</Text>
        <Text>Ghi chú: {data.ghiChu}</Text>
      </View>

      {/* Bảng dữ liệu kiểm tra */}
      <View style={styles.table}>
        {/* Header */}
        <View style={styles.tableRow}>
          {data.headers.map((header, index) => (
            <View key={index} style={styles.tableColHeader}>
              <Text style={styles.tableCellHeader}>{header}</Text>
            </View>
          ))}
        </View>
        {/* Rows */}
        {data.rows.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.tableRow}>
            {row.map((cell, cellIndex) => (
              <View key={cellIndex} style={styles.tableCol}>
                <Text style={styles.tableCell}>{cell}</Text>
              </View>
            ))}
          </View>
        ))}
      </View>

      {/* Phần xác nhận và ký tên */}
      <View style={styles.section}>
        <Text>Nhân viên kiểm tra: {data.nhanVienKiemTra}</Text>
        <Text>Thời gian kiểm tra: {data.thoiGianKiemTra}</Text>
        <Text>Xác nhận: {data.xacNhan}</Text>
        <Text>Đánh giá: {data.danhGia}</Text>
      </View>
    </Page>
  </Document>
);

export default ReportPDF;
