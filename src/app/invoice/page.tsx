"use client";

import React, { ReactNode, useState } from "react";
import { Formik, FieldArray, Form, Field } from "formik";
import * as Yup from "yup";
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Divider,
  TextField,
  Button,
  Grid,
} from "@mui/material";
import Image from "next/image";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

const validationSchema = Yup.object().shape({
  name: Yup.string().required("Name is required"),
  address: Yup.string().required("Address is required"),
  items: Yup.array().of(
    Yup.object().shape({
      description: Yup.string().required("Description is required"),
      quantity: Yup.number()
        .min(1, "Quantity must be at least 1")
        .required("Quantity is required"),
      unitPrice: Yup.number()
        .min(1, "Unit price must be greater than 0")
        .required("Unit Price is required"),
    })
  ),
});

export default function InvoicePage() {
  const [data, setData] = useState({
    submited: false,
    invoiceData: {},
  });
  const initialValues = {
    name: "",
    address: "",
    items: [{ description: "", quantity: 0, unitPrice: 0 }],
  };

  const calculateItemTotal = (quantity: number, unitPrice: number) =>
    quantity * unitPrice;

interface Item {
    description: string;
    quantity: number;
    unitPrice: number;
}

interface InvoiceData {
    name: string;
    address: string;
    items: Item[];
    total?: number;
}

const subtotal = (values: Item[]): number =>
    values.reduce(
        (acc, item) => acc + calculateItemTotal(item.quantity, item.unitPrice),
        0
    );


const generatePDF = async (name:string) => {
    const input = document.getElementById("invoice-form") as HTMLElement;
    const canvas = await html2canvas(input);
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF();
    const imgWidth = 190;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);
    pdf.save(`${name}-invoice.pdf`);
};

  const invoicedContainer = (rows): ReactNode => {
    console.log(rows, "rows");
    return (
      <>
        <Container maxWidth="md" sx={{ mt: 5, mb: 5 }} id="invoice-form">
          {/* Invoice Header */}
          <Box sx={{ mb: 4 }}>
            <Grid container justifyContent="space-between" alignItems="center">
              <Grid item>
                <Typography variant="h3" fontWeight="bold">
                  Invoice
                </Typography>
                <Typography variant="subtitle2">
                  Date: {new Date().toLocaleDateString()}
                </Typography>
              </Grid>
              <Grid item>
                <Image src="/logo.svg" width={120} height={40} alt="Logo" />
              </Grid>
            </Grid>
          </Box>

          <Divider sx={{ mb: 4 }} />
          <Box sx={{ mb: 4 }}></Box>

          {/* Billing Information */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Billed To:
            </Typography>
            <Typography variant="body1">{rows.name}</Typography>
            <Typography variant="body2">{rows.address}</Typography>
          </Box>

          {/* Table of Items */}
          <TableContainer component={Paper} sx={{ mb: 4 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Description</TableCell>
                  <TableCell align="center">Quantity</TableCell>
                  <TableCell align="center">Unit Price</TableCell>
                  <TableCell align="center">Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.items.map((row: Item, index:number) => (
                  <TableRow key={index}>
                    <TableCell>{row.description}</TableCell>
                    <TableCell align="center">{row.quantity}</TableCell>
                    <TableCell align="center">
                      {`ugx ${row.unitPrice.toFixed(2)}`}
                    </TableCell>
                    <TableCell align="center">{`ugx ${row.quantity * row.unitPrice}`}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Summary */}
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 4 }}>
            <Box>
              <Typography variant="h6" fontWeight="bold">
                Total: {`ugx ${rows.total.toFixed(2)}`}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "center", gap: 4 }}>
            <Box>
              <Image src="/paid.svg" width={100} height={100} alt="stamp" />
            </Box>
          </Box>

          {/* Footer */}
          <Box sx={{ mt: 4, textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">
              Grateful for the opportunity to serve you!
            </Typography>
          </Box>
        </Container>
        <Box>
          <Button variant="contained" color="secondary" onClick={()=>generatePDF(rows.name)}>
            Generate PDF
          </Button>
        </Box>
      </>
    );
  };

  return (
    <>
      {data.submited && invoicedContainer(data.invoiceData)}
      {!data.submited && (
        <Container
          maxWidth="lg"
          sx={{
            mt: 5,
            mb: 5,
            p: { xs: 2, md: 5 },
            backgroundColor: "#fff",
            boxShadow: 3,
          }}
        >
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={(values) =>
              setData({
                submited: true,
                invoiceData: { ...values, total: subtotal(values.items) },
              })
            }
          >
            {({ values, errors, touched }) => (
              <Form>
                {/* Invoice Header */}
                <Box sx={{ mb: 4 }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={6}>
                      <Typography
                        variant="h4"
                        fontWeight="bold"
                        sx={{ fontSize: { xs: "1.5rem", md: "2rem" } }}
                        color="#000"
                      >
                        Invoice
                      </Typography>
                      <Typography variant="subtitle2" color="#000">
                        Date: {new Date().toLocaleDateString()}
                      </Typography>
                    </Grid>
                    <Grid
                      item
                      xs={12}
                      sm={6}
                      sx={{ textAlign: { xs: "center", sm: "right" } }}
                    >
                      <Image
                        src="/logo.svg"
                        width={120}
                        height={40}
                        alt="Logo"
                      />
                    </Grid>
                  </Grid>
                </Box>

                {/* Customer Info */}
                <Box sx={{ mb: 4 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Field
                        as={TextField}
                        name="name"
                        label="Customer Name"
                        variant="outlined"
                        fullWidth
                        error={touched.name && Boolean(errors.name)}
                        helperText={touched.name && errors.name}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Field
                        as={TextField}
                        name="address"
                        label="Customer Address"
                        variant="outlined"
                        fullWidth
                        error={touched.address && Boolean(errors.address)}
                        helperText={touched.address && errors.address}
                      />
                    </Grid>
                  </Grid>
                </Box>

                <Divider sx={{ mb: 4 }} />

                {/* Items Table */}
                <TableContainer component={Paper} sx={{ mb: 4 }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Description</TableCell>
                        <TableCell align="center">Quantity</TableCell>
                        <TableCell align="center">Unit Price</TableCell>
                        <TableCell align="center">Total (UGX)</TableCell>
                        <TableCell align="center">Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <FieldArray name="items">
                        {({ push, remove }) => (
                          <>
                            {values.items.map((item, index) => (
                              <TableRow key={index}>
                                <TableCell>
                                  <Field
                                    as={TextField}
                                    name={`items[${index}].description`}
                                    placeholder="Item description"
                                    fullWidth
                                  />
                                </TableCell>
                                <TableCell align="center">
                                  <Field
                                    as={TextField}
                                    type="number"
                                    name={`items[${index}].quantity`}
                                    fullWidth
                                  />
                                </TableCell>
                                <TableCell align="center">
                                  <Field
                                    as={TextField}
                                    type="number"
                                    name={`items[${index}].unitPrice`}
                                    fullWidth
                                  />
                                </TableCell>
                                <TableCell align="center">
                                  {calculateItemTotal(
                                    item.quantity,
                                    item.unitPrice
                                  )}
                                </TableCell>
                                <TableCell align="center">
                                  <Button
                                    color="error"
                                    variant="contained"
                                    onClick={() => remove(index)}
                                  >
                                    Remove
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                            <TableRow>
                              <TableCell colSpan={5} align="center">
                                <Button
                                  color="primary"
                                  variant="contained"
                                  onClick={() =>
                                    push({
                                      description: "",
                                      quantity: 1,
                                      unitPrice: 0,
                                    })
                                  }
                                >
                                  Add Item
                                </Button>
                              </TableCell>
                            </TableRow>
                          </>
                        )}
                      </FieldArray>
                    </TableBody>
                  </Table>
                </TableContainer>

                {/* Summary */}
                <Box textAlign="right" sx={{ mb: 4 }}>
                  <Typography variant="h6" color="#000">
                    Total: UGX {subtotal(values.items).toFixed(2)}
                  </Typography>
                </Box>

                {/* Buttons */}
                <Grid container spacing={2} justifyContent="center">
                  <Grid item>
                    <Button type="submit" variant="contained" color="primary">
                      Submit Invoice
                    </Button>
                  </Grid>
                </Grid>
              </Form>
            )}
          </Formik>
        </Container>
      )}
    </>
  );
}
