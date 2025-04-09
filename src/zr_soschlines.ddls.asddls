@AccessControl.authorizationCheck: #CHECK
@Metadata.allowExtensions: true
@EndUserText.label: 'CDS View for soschemelines CRUD'
define root view entity ZR_soschlines
  as select from zsoschemelines as zsoschemelines
{
  @EndUserText.label: 'Company'
  key bukrs as Bukrs,
  @EndUserText.label: 'Sales Order'
  key salesorder as Salesorder,
  @EndUserText.label: 'Scheme Code'
  key schemecode as Schemecode,
  @EndUserText.label: 'Scheme Group Code'
  key schemecode as Schemegroupcode,
  @EndUserText.label: 'Product Code'
  key productcode as Productcode,
  @EndUserText.label: 'Scheme combination'
  schemecheckcode as Schemecheckcode,
  @EndUserText.label: 'Product Desc'
  productdesc as Productdesc,
  @EndUserText.label: 'Free Qty'
  freeqty as Freeqty,
  created_by as CreatedBy,
  created_at as CreatedAt,
  last_changed_by as LastChangedBy,
  @Semantics.systemDateTime.localInstanceLastChangedAt: true
  last_changed_at as LastChangedAt,
  local_last_changed_at as LocalLastChangedAt
  
}
