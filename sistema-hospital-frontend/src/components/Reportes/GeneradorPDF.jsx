import React from 'react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import QRCode from 'qrcode';
import { useAuth } from '../../contexts/AuthContext';

// Componente auxiliar para generar PDFs en el sistema
const GeneradorPDF = () => {
  const { currentUser } = useAuth();

  // Función para generar historial médico en PDF
  const generarHistorialMedico = async (paciente, diagnosticos) => {
    return new Promise(async (resolve, reject) => {
      try {
        const doc = new jsPDF();
        
        // Encabezado
        doc.setFontSize(18);
        doc.setTextColor(25, 118, 210); // Color primario
        doc.text('HISTORIAL MÉDICO', 105, 15, { align: 'center' });
        
        // Logo (simulado con un rectángulo)
        doc.setFillColor(25, 118, 210);
        doc.rect(15, 10, 30, 10, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(10);
        doc.text('HOSPITAL', 30, 16, { align: 'center' });
        
        // Línea separadora
        doc.setDrawColor(200, 200, 200);
        doc.line(15, 25, 195, 25);
        
        // Ficha de identificación del paciente
        doc.setTextColor(80, 80, 80);
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text('FICHA DE IDENTIFICACIÓN DEL PACIENTE', 105, 35, { align: 'center' });
        
        // Datos del paciente
        doc.setFontSize(12);
        doc.setFont(undefined, 'normal');
        doc.text(`Nombre: ${paciente['NOMBRE COMPLETO']}`, 15, 45);
        doc.text(`CUI: ${paciente.CUI}`, 15, 52);
        doc.text(`Edad: ${paciente.EDAD} años`, 15, 59);
        doc.text(`Sexo: ${paciente.SEXO}`, 105, 45);
        doc.text(`Expediente: ${paciente.EXPEDIENTE}`, 105, 52);
        doc.text(`Tipo de Sangre: ${paciente['TIPO SANGRE']}`, 105, 59);
        doc.text(`Fecha de Ingreso: ${paciente['FECHA INGRESO']}`, 15, 66);
        doc.text(`Teléfono: ${paciente.TELEFONO}`, 105, 66);
        
        // Diagnóstico actual (si no está de alta)
        if (!paciente.ALTA && diagnosticos.length > 0) {
          doc.setFillColor(242, 242, 242);
          doc.rect(15, 75, 180, 8, 'F');
          doc.setFontSize(14);
          doc.setFont(undefined, 'bold');
          doc.setTextColor(25, 118, 210);
          doc.text('DIAGNÓSTICO ACTUAL', 105, 81, { align: 'center' });
          
          const diagnosticoActual = diagnosticos[0]; // Asumiendo que el primero es el actual
          
          doc.setFontSize(12);
          doc.setFont(undefined, 'normal');
          doc.setTextColor(80, 80, 80);
          doc.text(`Diagnóstico Principal: ${diagnosticoActual.DIAGNOSTICO_PRINCIPAL}`, 15, 95);
          
          // Dividir texto largo en múltiples líneas
          const splitSintomas = doc.splitTextToSize(`Síntomas: ${diagnosticoActual.SINTOMAS}`, 170);
          doc.text(splitSintomas, 15, 102);
          
          let yPos = 102 + (splitSintomas.length * 7);
          
          const splitTratamiento = doc.splitTextToSize(`Plan de Tratamiento: ${diagnosticoActual.PLAN_TRATAMIENTO}`, 170);
          doc.text(splitTratamiento, 15, yPos);
          
          yPos += splitTratamiento.length * 7 + 10;
        } else {
          const yPos = 75;
        }
        
        // Historial de diagnósticos anteriores
        doc.setFillColor(242, 242, 242);
        doc.rect(15, 130, 180, 8, 'F');
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(25, 118, 210);
        doc.text('HISTORIAL DE DIAGNÓSTICOS', 105, 136, { align: 'center' });
        
        // Tabla de diagnósticos
        const historialData = diagnosticos.map(diag => [
          diag.ID,
          diag.DIAGNOSTICO_PRINCIPAL,
          diag.TIEMPO_INICIAL ? new Date(diag.TIEMPO_INICIAL).toLocaleDateString() : 'N/A',
          diag.TIEMPO_FINAL ? new Date(diag.TIEMPO_FINAL).toLocaleDateString() : 'En tratamiento'
        ]);
        
        doc.autoTable({
          startY: 145,
          head: [['ID', 'Diagnóstico', 'Fecha Ingreso', 'Fecha Alta']],
          body: historialData,
          theme: 'grid',
          headStyles: {
            fillColor: [25, 118, 210],
            textColor: [255, 255, 255],
            fontStyle: 'bold'
          },
          styles: {
            font: 'helvetica',
            fontSize: 10
          }
        });
        
        // Firma digital
        const firmaY = doc.lastAutoTable.finalY + 20;
        
        if (firmaY > 250) {
          // Si no hay espacio suficiente, agregar nueva página
          doc.addPage();
          firmaY = 20;
        }
        
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(25, 118, 210);
        doc.text('FIRMA DIGITAL', 105, firmaY, { align: 'center' });
        
        // Generar QR con información del doctor y reporte
        const qrData = JSON.stringify({
          tipo: 'historial_medico',
          paciente: paciente.CUI,
          fecha: new Date().toISOString(),
          doctor: currentUser ? {
            id: currentUser.id,
            nombre: currentUser.nombre
          } : 'Sistema Automatizado',
          hash: Math.random().toString(36).substring(7)
        });
        
        const qrDataUrl = await QRCode.toDataURL(qrData);
        doc.addImage(qrDataUrl, 'PNG', 75, firmaY + 5, 60, 60);
        
        // Información del pie de página
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(120, 120, 120);
        doc.text('Este documento es parte del historial médico electrónico y contiene una firma digital.', 105, firmaY + 75, { align: 'center' });
        doc.text('Liga Guatemalteca del Corazón - Sistema de Monitoreo Hospitalario', 105, firmaY + 80, { align: 'center' });
        
        // Devolver el documento
        const pdfBlob = doc.output('blob');
        resolve(pdfBlob);
      } catch (error) {
        console.error('Error al generar PDF:', error);
        reject(error);
      }
    });
  };

  // Función para generar certificado de alta médica
  const generarCertificadoAlta = async (paciente, diagnostico, doctor, estadisticas) => {
    return new Promise(async (resolve, reject) => {
      try {
        const doc = new jsPDF();
        
        // Encabezado
        doc.setFontSize(18);
        doc.setTextColor(76, 175, 80); // Color verde
        doc.text('CERTIFICADO DE ALTA MÉDICA', 105, 15, { align: 'center' });
        
        // Logo (simulado con un rectángulo)
        doc.setFillColor(76, 175, 80);
        doc.rect(15, 10, 30, 10, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(10);
        doc.text('HOSPITAL', 30, 16, { align: 'center' });
        
        // Línea separadora
        doc.setDrawColor(200, 200, 200);
        doc.line(15, 25, 195, 25);
        
        // Fecha y número
        doc.setTextColor(120, 120, 120);
        doc.setFontSize(10);
        doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 15, 32);
        doc.text(`No. Certificado: ${diagnostico.ID}-${Math.floor(Math.random() * 10000)}`, 160, 32);
        
        // Título
        doc.setFillColor(242, 242, 242);
        doc.rect(15, 40, 180, 8, 'F');
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(76, 175, 80);
        doc.text('DATOS DEL PACIENTE', 105, 46, { align: 'center' });
        
        // Datos del paciente
        doc.setFontSize(12);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(80, 80, 80);
        doc.text(`Nombre: ${paciente['NOMBRE COMPLETO']}`, 15, 60);
        doc.text(`CUI: ${paciente.CUI}`, 15, 67);
        doc.text(`Edad: ${paciente.EDAD} años`, 15, 74);
        doc.text(`Sexo: ${paciente.SEXO}`, 105, 60);
        doc.text(`Expediente: ${paciente.EXPEDIENTE}`, 105, 67);
        doc.text(`Tipo de Sangre: ${paciente['TIPO SANGRE']}`, 105, 74);
        
        // Información del diagnóstico
        doc.setFillColor(242, 242, 242);
        doc.rect(15, 85, 180, 8, 'F');
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(76, 175, 80);
        doc.text('INFORMACIÓN MÉDICA', 105, 91, { align: 'center' });
        
        // Fechas
        doc.setFontSize(12);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(80, 80, 80);
        
        const fechaInicio = diagnostico.TIEMPO_INICIAL ? new Date(diagnostico.TIEMPO_INICIAL).toLocaleDateString() : 'N/A';
        const fechaFin = diagnostico.TIEMPO_FINAL ? new Date(diagnostico.TIEMPO_FINAL).toLocaleDateString() : new Date().toLocaleDateString();
        
        doc.text(`Fecha de Ingreso: ${fechaInicio}`, 15, 105);
        doc.text(`Fecha de Alta: ${fechaFin}`, 105, 105);
        
        // Calcular días de hospitalización
        let diasHospitalizacion = 'N/A';
        if (diagnostico.TIEMPO_INICIAL && diagnostico.TIEMPO_FINAL) {
          const inicio = new Date(diagnostico.TIEMPO_INICIAL);
          const fin = new Date(diagnostico.TIEMPO_FINAL);
          const diff = Math.abs(fin - inicio);
          diasHospitalizacion = `${Math.ceil(diff / (1000 * 60 * 60 * 24))} días`;
        }
        
        doc.text(`Tiempo de Hospitalización: ${diasHospitalizacion}`, 15, 112);
        
        // Diagnóstico
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text('Diagnóstico Principal:', 15, 125);
        
        doc.setFont(undefined, 'normal');
        doc.text(diagnostico.DIAGNOSTICO_PRINCIPAL, 70, 125);
        
        // Síntomas y tratamiento
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text('Síntomas Tratados:', 15, 135);
        
        doc.setFont(undefined, 'normal');
        const splitSintomas = doc.splitTextToSize(diagnostico.SINTOMAS, 170);
        doc.text(splitSintomas, 15, 142);
        
        let yPos = 142 + (splitSintomas.length * 7);
        
        doc.setFont(undefined, 'bold');
        doc.text('Plan de Tratamiento Aplicado:', 15, yPos);
        
        doc.setFont(undefined, 'normal');
        const splitTratamiento = doc.splitTextToSize(diagnostico.PLAN_TRATAMIENTO, 170);
        doc.text(splitTratamiento, 15, yPos + 7);
        
        yPos += splitTratamiento.length * 7 + 15;
        
        // Estadísticas durante el tratamiento
        if (estadisticas) {
          doc.setFillColor(242, 242, 242);
          doc.rect(15, yPos, 180, 8, 'F');
          doc.setFontSize(14);
          doc.setFont(undefined, 'bold');
          doc.setTextColor(76, 175, 80);
          doc.text('ESTADÍSTICAS DEL TRATAMIENTO', 105, yPos + 6, { align: 'center' });
          
          doc.setFontSize(12);
          doc.setTextColor(80, 80, 80);
          
          yPos += 20;
          
          doc.text(`ECG - Valor Máximo: ${estadisticas.Maximo}`, 15, yPos);
          doc.text(`ECG - Valor Mínimo: ${estadisticas.Minimo}`, 105, yPos);
          doc.text(`ECG - Valor Promedio: ${estadisticas.Promedio}`, 15, yPos + 7);
          
          yPos += 20;
        }
        
        // Firma digital
        const firmaY = yPos + 10;
        
        if (firmaY > 250) {
          // Si no hay espacio suficiente, agregar nueva página
          doc.addPage();
          firmaY = 20;
        }
        
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(76, 175, 80);
        doc.text('FIRMA DIGITAL DEL MÉDICO', 105, firmaY, { align: 'center' });
        
        // Generar QR con información del doctor y certificado
        const qrData = JSON.stringify({
          tipo: 'certificado_alta',
          paciente: paciente.CUI,
          diagnostico: diagnostico.ID,
          fecha_alta: diagnostico.TIEMPO_FINAL || new Date().toISOString(),
          doctor: {
            id: doctor.ID_USUARIO,
            nombre: doctor.NOMBRE
          },
          hash: Math.random().toString(36).substring(7)
        });
        
        const qrDataUrl = await QRCode.toDataURL(qrData);
        doc.addImage(qrDataUrl, 'PNG', 75, firmaY + 5, 60, 60);
        
        // Información del médico
        doc.setFontSize(12);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(80, 80, 80);
        doc.text(`Dr. ${doctor.NOMBRE}`, 105, firmaY + 75, { align: 'center' });
        doc.text(`Médico Especialista - ID: ${doctor.ID_USUARIO}`, 105, firmaY + 82, { align: 'center' });
        
        // Información del pie de página
        doc.setFontSize(10);
        doc.setTextColor(120, 120, 120);
        doc.text('Este documento es parte del historial médico electrónico y contiene una firma digital.', 105, firmaY + 95, { align: 'center' });
        doc.text('Liga Guatemalteca del Corazón - Sistema de Monitoreo Hospitalario', 105, firmaY + 100, { align: 'center' });
        
        // Devolver el documento
        const pdfBlob = doc.output('blob');
        resolve(pdfBlob);
      } catch (error) {
        console.error('Error al generar PDF:', error);
        reject(error);
      }
    });
  };

  // Componente no renderiza nada, solo expone funcionalidad
  return null;
};

export default GeneradorPDF;