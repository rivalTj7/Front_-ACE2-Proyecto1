import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import QRCode from 'qrcode';

export const pdfService = {
  // Generar historial médico en PDF
  generarHistorialMedico: async (paciente, diagnosticos) => {
    const doc = new jsPDF();
    
    // Agregar encabezado
    doc.setFontSize(18);
    doc.text('HISTORIAL MÉDICO', 105, 15, { align: 'center' });
    
    // Ficha de identificación del paciente
    doc.setFontSize(14);
    doc.text('FICHA DE IDENTIFICACIÓN DEL PACIENTE', 105, 25, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text(`Nombre: ${paciente['NOMBRE COMPLETO']}`, 15, 35);
    doc.text(`CUI: ${paciente.CUI}`, 15, 42);
    doc.text(`Edad: ${paciente.EDAD}`, 15, 49);
    doc.text(`Sexo: ${paciente.SEXO}`, 15, 56);
    doc.text(`Expediente: ${paciente.EXPEDIENTE}`, 15, 63);
    doc.text(`Tipo de Sangre: ${paciente['TIPO SANGRE']}`, 15, 70);
    doc.text(`Fecha de Ingreso: ${paciente['FECHA INGRESO']}`, 15, 77);
    
    // Diagnóstico actual (si no está de alta)
    if (!paciente.ALTA) {
      doc.setFontSize(14);
      doc.text('DIAGNÓSTICO ACTUAL', 105, 90, { align: 'center' });
      
      const diagnosticoActual = diagnosticos[0]; // Asumiendo que el primero es el actual
      
      doc.setFontSize(12);
      doc.text(`Diagnóstico Principal: ${diagnosticoActual.DIAGNOSTICO_PRINCIPAL}`, 15, 100);
      doc.text(`Síntomas: ${diagnosticoActual.SINTOMAS}`, 15, 107);
      doc.text(`Plan de Tratamiento: ${diagnosticoActual.PLAN_TRATAMIENTO}`, 15, 114);
    }
    
    // Historial de diagnósticos anteriores
    doc.setFontSize(14);
    doc.text('HISTORIAL DE DIAGNÓSTICOS', 105, 130, { align: 'center' });
    
    const historialData = diagnosticos.map(diag => [
      diag.ID,
      diag.DIAGNOSTICO_PRINCIPAL,
      diag.TIEMPO_INICIAL ? new Date(diag.TIEMPO_INICIAL).toLocaleDateString() : 'N/A',
      diag.TIEMPO_FINAL ? new Date(diag.TIEMPO_FINAL).toLocaleDateString() : 'En tratamiento'
    ]);
    
    doc.autoTable({
      startY: 140,
      head: [['ID', 'Diagnóstico', 'Fecha Ingreso', 'Fecha Alta']],
      body: historialData,
    });
    
    return doc.output('blob');
  },
  
  // Generar certificado de alta médica
  generarCertificadoAlta: async (paciente, diagnostico, doctor, estadisticas) => {
    const doc = new jsPDF();
    
    // Título
    doc.setFontSize(18);
    doc.text('CERTIFICADO DE ALTA MÉDICA', 105, 15, { align: 'center' });
    
    // Datos del paciente
    doc.setFontSize(12);
    doc.text(`Paciente: ${paciente['NOMBRE COMPLETO']}`, 15, 30);
    doc.text(`CUI: ${paciente.CUI}`, 15, 37);
    doc.text(`Fecha de atención: ${new Date().toLocaleDateString()}`, 15, 44);
    doc.text(`Tiempo de tratamiento: ${
      diagnostico.TIEMPO_INICIAL && diagnostico.TIEMPO_FINAL 
        ? calcularDiferenciaFechas(new Date(diagnostico.TIEMPO_INICIAL), new Date(diagnostico.TIEMPO_FINAL))
        : 'No disponible'
    }`, 15, 51);
    
    // Diagnóstico
    doc.setFontSize(14);
    doc.text('DIAGNÓSTICO Y TRATAMIENTO REALIZADO', 105, 65, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text(`Diagnóstico Principal: ${diagnostico.DIAGNOSTICO_PRINCIPAL}`, 15, 75);
    doc.text(`Síntomas: ${diagnostico.SINTOMAS}`, 15, 82);
    doc.text(`Condiciones: ${diagnostico.CONDICIONES}`, 15, 89);
    doc.text(`Plan de Tratamiento: ${diagnostico.PLAN_TRATAMIENTO}`, 15, 96);
    
    // Estadísticas
    doc.setFontSize(14);
    doc.text('ESTADÍSTICAS DURANTE EL TRATAMIENTO', 105, 110, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text(`ECG - Valor Máximo: ${estadisticas.Maximo}`, 15, 120);
    doc.text(`ECG - Valor Mínimo: ${estadisticas.Minimo}`, 15, 127);
    doc.text(`ECG - Valor Promedio: ${estadisticas.Promedio}`, 15, 134);
    
    // Firma digital
    doc.setFontSize(14);
    doc.text('FIRMA DIGITAL DEL MÉDICO', 105, 155, { align: 'center' });
    
    // Generar un código QR con información del doctor y timestamp
    const qrData = JSON.stringify({
      doctor: doctor.NOMBRE,
      id: doctor.ID_USUARIO,
      timestamp: new Date().toISOString(),
      paciente: paciente.CUI
    });
    
    try {
      const qrDataUrl = await QRCode.toDataURL(qrData);
      doc.addImage(qrDataUrl, 'PNG', 75, 160, 60, 60);
      
      doc.setFontSize(12);
      doc.text(`Dr. ${doctor.NOMBRE}`, 105, 230, { align: 'center' });
      doc.text(`Cédula profesional: ${doctor.ID_USUARIO}`, 105, 237, { align: 'center' });
    } catch (err) {
      console.error('Error al generar QR:', err);
      doc.text('Error al generar la firma digital', 105, 180, { align: 'center' });
    }
    
    return doc.output('blob');
  }
};

// Función de utilidad para calcular diferencia entre fechas
function calcularDiferenciaFechas(fechaInicio, fechaFin) {
  const diffTime = Math.abs(fechaFin - fechaInicio);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    return `${diffHours} horas`;
  }
  
  return `${diffDays} días`;
}