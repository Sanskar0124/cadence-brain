// Utils
const { USER_LANGUAGES } = require('../../utils/enums');
const TRANSLATIONS = require('../../utils/translations');

/**
  Invitation mail body for super admin
  @param {string} url to redirect to join cadence 
  @param {string }user_first_name first name of the user to whom invite mail is being sent 
  @param {string} language  
  user's language
  enum to be used: USER_LANGUAGES 
 */
const inviteMailForSuperAdmin = ({ url, user_first_name, language }) => {
  // if not language is passed, set english as default language
  if (!language) language = USER_LANGUAGES.ENGLISH;
  // adding language in url as a param
  if (url)
    if (url?.includes('?')) url += `&lang=${language}`;
    else url += `?lang=${language}`;
  return `
<!DOCTYPE 
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
  </head>
  <body style="padding: 0; margin: 0; font-family: 'Open Sans', sans-serif">
<div>
	<table
		border="0"
		align="center"
		width="100%"
		cellpadding="0"
		cellspacing="0"
		bgcolor="#cfe5ff"
		style="background-color: rgb(207, 229, 255)"
	>
		<tbody>
			<tr>
				<td align="center" valign="top">
					<table
						border="0"
						cellpadding="0"
						cellspacing="0"
						width="590"
						style="max-width: 590px !important; width: 590px"
					>
						<tbody>
							<tr>
								<td align="center" valign="top">
									<table
										width="100%"
										cellpadding="0"
										border="0"
										cellspacing="0"
										style="min-width: 590px"
										name="Layout_0"
										id="m_852426457734446249m_2762524079405586479m_-3152227415448163846m_-515664811609128119Layout_0"
									>
										<tbody>
											<tr>
												<td valign="top" align="center" style="min-width: 590px">
													<a
														href="#m_852426457734446249_m_2762524079405586479_m_-3152227415448163846_m_-515664811609128119_"
														name="m_852426457734446249_m_2762524079405586479_m_-3152227415448163846_m_-515664811609128119_Layout_0"
													></a>
													<table
														width="100%"
														cellpadding="0"
														border="0"
														height="38"
														cellspacing="0"
													>
														<tbody>
															<tr>
																<td valign="top" height="38">
																	<img
																		width="20"
																		height="38"
																		style="
																			display: block;
																			max-height: 38px;
																			max-width: 20px;
																		"
																		alt=""
																		src="https://ci6.googleusercontent.com/proxy/JJXNXtod3J5vmYNWxJC5L_G_H-P2FzaQHHLGO7sXgns0syTGHKPh_yb4G2mxImN4Hab8BVPVhicQZTxRQG6uS7U5_JFBHOaefL5ZvEU1UEbkqRIiZI1PtVZSSBZoz-08dNz5t6hqAAYSf5fNu4xN2u6-mX6H93SrSQVuJNWFfeOUn9JNoUZ4febu_B4fcznYXuwFhpQXywoAJgdhLF5cNNeVVVeRg-mjJ6cYQcsDmtJRCm8wZVY2qtqpQFOiuvT0jJaf2x_saWEI4Tirc1fS91_MqzEg9fSF7flhGBbXqo1XyjT-E9qFfTJNXvxeJ5AcrBGPAAfoVUInttGczFD8H7vM2CzFVzg24PsXufJCBvT5HHX-dCCgWgGrKYf5NyPVv6YNmuSzLIqy9aJ1Sz4BZz3hqX19krH4MTX7RcJtLKxtKj-pUqY9z1gwt_XXZFPlioYdMW57oJbfwdJZd8hQJAodTJwNXIqYJPGuFR5n=s0-d-e1-ft#https://r.sb.ringover.com/im/1392961/f3c414c98b19f5414edf4dbd6d787ab431715f284bfaa8c4d5c248a604c20ea1.gif?e=E-YvmDaeLcqVRaEcUQKdTjX65qGGGYTOTjBFRgybTEQ25a1lQskW-n-p8T-GvEiEjv_fpZbFm0d8LKVC19XO37RW2AYEsG_eUKR4Gh86dIlnkXvHS2JHwu0eHOpv7VIzo19n-7YQkMMy7wergZk2sb-f5Apmav_qgsXbt8D0jL2dq22CIz1tQeg6f4Ac20OpJet9o0nkWO9vV7pUzcI5xGAaM6yWDuPKXti-txuf3Cj3rg"
																		class="CToWUd"
																		data-bit="iit"
																	/>
																</td>
															</tr>
														</tbody>
													</table>
												</td>
											</tr>
										</tbody>
									</table>
								</td>
							</tr>
							<tr>
								<td align="center" valign="top">
									<div style="background-color: rgb(255, 255, 255); border-radius: 0px">
										<table
											width="100%"
											cellpadding="0"
											border="0"
											cellspacing="0"
											style="min-width: 590px"
											name="Layout_1"
											id="m_852426457734446249m_2762524079405586479m_-3152227415448163846m_-515664811609128119Layout_1"
										>
											<tbody>
												<tr>
													<td align="center" valign="top" style="min-width: 590px">
														<a
															href="#m_852426457734446249_m_2762524079405586479_m_-3152227415448163846_m_-515664811609128119_"
															name="m_852426457734446249_m_2762524079405586479_m_-3152227415448163846_m_-515664811609128119_Layout_1"
														></a>
														<table
															width="100%"
															border="0"
															cellpadding="0"
															cellspacing="0"
															bgcolor="#ffffff"
															style="
																background-color: rgb(255, 255, 255);
																border-radius: 0px;
																padding-left: 20px;
																padding-right: 20px;
																border-collapse: separate;
															"
														>
															<tbody>
																<tr>
																	<td
																		height="20"
																		style="font-size: 1px; line-height: 20px"
																	>
																		&nbsp;
																	</td>
																</tr>
																<tr>
																	<td valign="top" align="left">
																		<table
																			width="100%"
																			cellpadding="0"
																			border="0"
																			align="center"
																			cellspacing="0"
																		>
																			<tbody>
																				<tr>
																					<td valign="top" align="center">
																						<table
																							cellpadding="0"
																							border="0"
																							align="center"
																							cellspacing="0"
																						>
																							<tbody>
																								<tr>
																									<td
																										valign="middle"
																										align="center"
																										style="line-height: 1px"
																									>
																										<div
																											style="
																												border-top: 0px None #000;
																												border-right: 0px None #000;
																												border-bottom: 0px None #000;
																												border-left: 0px None #000;
																												display: inline-block;
																											"
																											cellspacing="0"
																											cellpadding="0"
																											border="0"
																										>
																											<div>
																												<img
																													width="550"
																													vspace="0"
																													hspace="0"
																													border="0"
																													alt="BJT Partners"
																													style="
																														float: left;
																														max-width: 550px;
																														display: block;
																													"
																													src="https://storage.googleapis.com/apt-cubist-307713.appspot.com/cadence/ringover_banner.webp"
																													class="CToWUd"
																													data-bit="iit"
																												/>
																											</div>
																										</div>
																									</td>
																								</tr>
																							</tbody>
																						</table>
																					</td>
																				</tr>
																			</tbody>
																		</table>
																	</td>
																</tr>
																<tr>
																	<td
																		height="20"
																		style="font-size: 1px; line-height: 20px"
																	>
																		&nbsp;
																	</td>
																</tr>
															</tbody>
														</table>
													</td>
												</tr>
											</tbody>
										</table>
									</div>
								</td>
							</tr>
							<tr>
								<td align="center" valign="top">
									<div style="background-color: rgb(255, 255, 255); border-radius: 0px">
										<table
											width="100%"
											cellpadding="0"
											border="0"
											cellspacing="0"
											name="Layout_2"
											id="m_852426457734446249m_2762524079405586479m_-3152227415448163846m_-515664811609128119Layout_2"
										>
											<tbody>
												<tr>
													<td align="center" valign="top">
														<a
															href="#m_852426457734446249_m_2762524079405586479_m_-3152227415448163846_m_-515664811609128119_"
															name="m_852426457734446249_m_2762524079405586479_m_-3152227415448163846_m_-515664811609128119_Layout_2"
														></a>
														<table
															border="0"
															width="100%"
															cellpadding="0"
															cellspacing="0"
															bgcolor="#ffffff"
															style="
																height: 0px;
																background-color: rgb(255, 255, 255);
																border-radius: 0px;
																border-collapse: separate;
																padding-left: 20px;
																padding-right: 20px;
															"
														>
															<tbody>
																<tr>
																	<td>
																		<table
																			border="0"
																			cellpadding="0"
																			cellspacing="0"
																			align="center"
																			style="margin: auto"
																		>
																			<tbody>
																				<tr>
																					<th
																						align="center"
																						style="
																							text-align: center;
																							font-weight: normal;
																						"
																					>
																						<table
																							border="0"
																							cellspacing="0"
																							cellpadding="0"
																							align="center"
																						>
																							<tbody>
																								<tr>
																									<td height="10"></td>
																								</tr>

																								<tr>
																									<td
																										style="
																											font-family: Arial, Helvetica,
																												sans-serif;
																											color: #3c4858;
																											text-align: center;
																										"
																									>
																										<span style="color: #3c4858"
																											><span style="color: #000000"
																												><strong
																													><span style="font-size: 24px"
																														>${TRANSLATIONS?.GET_STARTED_WITH_CADENCE?.[language] || ''}</span
																													></strong
																												></span
																											></span
																										>
																									</td>
																								</tr>
																								<tr>
																									<td height="10"></td>
																								</tr>
																							</tbody>
																						</table>
																					</th>
																				</tr>
																			</tbody>
																		</table>
																	</td>
																</tr>
															</tbody>
														</table>
													</td>
												</tr>
											</tbody>
										</table>
									</div>
								</td>
							</tr>
							<tr>
								<td align="center" valign="top">
									<div style="background-color: rgb(255, 255, 255); border-radius: 0px">
										<table
											width="100%"
											cellpadding="0"
											border="0"
											cellspacing="0"
											style="min-width: 100%"
											name="Layout_8"
										>
											<tbody>
												<tr>
													<td align="center" valign="top">
														<a
															href="#m_852426457734446249_m_2762524079405586479_m_-3152227415448163846_m_-515664811609128119_"
															name="m_852426457734446249_m_2762524079405586479_m_-3152227415448163846_m_-515664811609128119_Layout_8"
														></a>
														<table
															width="100%"
															border="0"
															cellpadding="0"
															cellspacing="0"
															bgcolor="#ffffff"
															style="
																background-color: rgb(255, 255, 255);
																padding-left: 20px;
																padding-right: 20px;
																border-collapse: separate;
																border-radius: 0px;
																border-bottom: 0px none rgb(200, 200, 200);
															"
														>
															<tbody>
																<tr>
																	<td
																		height="20"
																		style="font-size: 1px; line-height: 20px"
																	>
																		&nbsp;
																	</td>
																</tr>
																<tr>
																	<td valign="top" align="left">
																		<table
																			width="100%"
																			border="0"
																			cellpadding="0"
																			cellspacing="0"
																		>
																			<tbody>
																				<tr>
																					<th
																						style="
																							text-align: left;
																							font-weight: normal;
																							padding-right: 0px;
																						"
																						valign="top"
																					>
																						<table
																							border="0"
																							valign="top"
																							cellspacing="0"
																							cellpadding="0"
																							width="100%"
																							align="left"
																						>
																							<tbody>
																								<tr>
																									<td
																										style="
																											font-size: 14px;
																											font-family: Arial, Helvetica,
																												sans-serif, sans-serif;
																										"
																									>
																										<div style="color: rgb(60, 72, 88)">
																											<br /><span style="color: #000000"
																												>${TRANSLATIONS?.HI?.[language] || ''}${
    language === USER_LANGUAGES.SPANISH ? ',' : ''
  } ${user_first_name}${language === USER_LANGUAGES.SPANISH ? ':' : ','}</span
																											>
																										</div>
																										<div style="color: rgb(60, 72, 88)">
																											<span style="color: rgb(0, 0, 0)"
																												><br
																											/></span>
																										</div>
																										<div style="color: rgb(60, 72, 88)">
																											<span style="color: rgb(0, 0, 0)"
																												>${TRANSLATIONS?.YOU_HAVE_BEEN_INVITED?.[language] || ''}.</span
																											>
																										</div>
																										<div style="color: rgb(60, 72, 88)">
																											<span style="color: rgb(0, 0, 0)"
																												>&nbsp;</span
																											><span style="color: #000000"
																												><br
																											/></span>
																										</div>

																										<div>
																											<font color="#000000"
																												>${TRANSLATIONS?.KINDLY_CLICK_ON_BUTTON?.[language] || ''}.</font
																											>
																										</div>
																									</td>
																								</tr>
																							</tbody>
																						</table>
																					</th>
																				</tr>
																			</tbody>
																		</table>
																	</td>
																</tr>
																<tr>
																	<td
																		height="20"
																		style="font-size: 1px; line-height: 20px"
																	>
																		<br />
																	</td>
																</tr>
															</tbody>
														</table>
													</td>
												</tr>
											</tbody>
										</table>
									</div>
								</td>
							</tr>
							<tr>
								<td align="center" valign="top">
									<div style="background-color: rgb(255, 255, 255); border-radius: 0px">
										<table
											width="100%"
											cellpadding="0"
											border="0"
											cellspacing="0"
											style="min-width: 100%"
											name="Layout_9"
											id="m_852426457734446249m_2762524079405586479m_-3152227415448163846m_-515664811609128119Layout_9"
										>
											<tbody>
												<tr>
													<td align="center" valign="top">
														<a
															href="#m_852426457734446249_m_2762524079405586479_m_-3152227415448163846_m_-515664811609128119_"
															name="m_852426457734446249_m_2762524079405586479_m_-3152227415448163846_m_-515664811609128119_Layout_9"
														></a>
														<table
															width="100%"
															border="0"
															cellpadding="0"
															cellspacing="0"
															bgcolor="#ffffff"
															style="
																max-width: 100%;
																min-width: 100%;
																table-layout: fixed;
																background-color: rgb(255, 255, 255);
																border-radius: 0px;
																border-collapse: separate;
																padding-left: 20px;
																padding-right: 20px;
															"
														>
															<tbody>
																<tr>
																	<td
																		height="20"
																		style="font-size: 1px; line-height: 20px"
																	>
																		<br />
																	</td>
																</tr>
																<tr>
																	<td valign="top" align="left">
																		<table
																			width="100%"
																			border="0"
																			cellpadding="0"
																			cellspacing="0"
																		>
																			<tbody>
																				<tr>
																					<th
																						style="
																							text-align: left;
																							font-weight: normal;
																							padding-right: 0px;
																						"
																						width="550"
																						valign="top"
																					>
																						<table
																							border="0"
																							valign="top"
																							cellspacing="0"
																							cellpadding="0"
																							align="left"
																							width="550"
																						>
																							<tbody>
																								<tr>
																									<td
																										height="10"
																										style="
																											font-size: 1px;
																											line-height: 10px;
																										"
																									>
																										&nbsp;
																									</td>
																								</tr>
																								<tr>
																									<td valign="top">
																										<table
																											cellpadding="0"
																											border="0"
																											align="left"
																											cellspacing="0"
																											style="
																												border-collapse: separate;
																												margin: 0 auto;
																											"
																										>
																											<tbody>
																												<tr>
																													<td>
																														<a
																															href="${url}"
																															style="
																																display: table;
																																text-decoration: none;
																																color: #000000;
																																cursor: pointer;
																																font-size: 14px;
																																font-family: Arial,
																																	Helvetica, sans-serif;
																																text-align: center;
																																font-weight: normal;
																																padding-left: 18px;
																																padding-right: 18px;
																																background-color: #cfe5ff;
																																border-top: 0px None #000;
																																border-right: 0px None
																																	#af5a5a;
																																border-bottom: 0px None
																																	#000;
																																border-left: 0px None #000;
																																height: 32px;
																																border-radius: 4px;
																															"
																															><span
																																style="
																																	display: table-cell;
																																	vertical-align: middle;
																																"
																																>${TRANSLATIONS?.JOIN_CADENCE?.[language] || ''}</span
																															></a
																														>
																													</td>
																												</tr>
																											</tbody>
																										</table>
																									</td>
																								</tr>
																							</tbody>
																						</table>
																					</th>
																				</tr>
																			</tbody>
																		</table>
																	</td>
																</tr>
																<tr>
																	<td
																		height="20"
																		style="font-size: 1px; line-height: 20px"
																	>
																		&nbsp;
																	</td>
																</tr>
															</tbody>
														</table>
													</td>
												</tr>
											</tbody>
										</table>
									</div>
								</td>
							</tr>
							<tr>
								<td align="center" valign="top">
									<div style="background-color: rgb(255, 255, 255); border-radius: 0px">
										<table
											width="100%"
											cellpadding="0"
											border="0"
											cellspacing="0"
											style="min-width: 100%"
											name="Layout_10"
										>
											<tbody>
												<tr>
													<td align="center" valign="top">
														<a
															href="#m_852426457734446249_m_2762524079405586479_m_-3152227415448163846_m_-515664811609128119_"
															name="m_852426457734446249_m_2762524079405586479_m_-3152227415448163846_m_-515664811609128119_Layout_10"
														></a>
														<table
															width="100%"
															border="0"
															cellpadding="0"
															cellspacing="0"
															bgcolor="#ffffff"
															style="
																background-color: rgb(255, 255, 255);
																padding-left: 20px;
																padding-right: 20px;
																border-collapse: separate;
																border-radius: 0px;
																border-bottom: 0px none rgb(200, 200, 200);
															"
														>
															<tbody>
																<tr>
																	<td
																		height="20"
																		style="font-size: 1px; line-height: 20px"
																	>
																		&nbsp;
																	</td>
																</tr>
																<tr>
																	<td valign="top" align="left">
																		<table
																			width="100%"
																			border="0"
																			cellpadding="0"
																			cellspacing="0"
																		>
																			<tbody>
																				<tr>
																					<th
																						style="
																							text-align: left;
																							font-weight: normal;
																							padding-right: 0px;
																						"
																						valign="top"
																					>
																						<table
																							border="0"
																							valign="top"
																							cellspacing="0"
																							cellpadding="0"
																							width="100%"
																							align="left"
																						>
																							<tbody>
																								<tr>
																									<td
																										style="
																											font-size: 14px;
																											font-family: Arial, Helvetica,
																												sans-serif, sans-serif;
																											color: #3c4858;
																										"
																									>
																										<div>
																											<span style="color: #000000"
																												>${TRANSLATIONS?.SEE_YOU_SOON?.[language] || ''},</span
																											>
																										</div>

																										<div>&nbsp;</div>

																										<div>
																											<span style="color: #000000"
																												>${TRANSLATIONS?.THE_CADENCE_TEAM?.[language] || ''}</span
																											>
																										</div>
																									</td>
																								</tr>
																							</tbody>
																						</table>
																					</th>
																				</tr>
																			</tbody>
																		</table>
																	</td>
																</tr>
																<tr>
																	<td
																		height="20"
																		style="font-size: 1px; line-height: 20px"
																	>
																		&nbsp;
																	</td>
																</tr>
															</tbody>
														</table>
													</td>
												</tr>
											</tbody>
										</table>
									</div>
								</td>
							</tr>
							<tr>
								<td align="center" valign="top">
									<table
										width="100%"
										cellpadding="0"
										border="0"
										cellspacing="0"
										style="min-width: 590px"
										name="Layout_"
										id="m_852426457734446249m_2762524079405586479m_-3152227415448163846m_-515664811609128119Layout_"
									>
										<tbody>
											<tr>
												<td valign="top" align="center" style="min-width: 590px">
													<a
														href="#m_852426457734446249_m_2762524079405586479_m_-3152227415448163846_m_-515664811609128119_"
														name="m_852426457734446249_m_2762524079405586479_m_-3152227415448163846_m_-515664811609128119_Layout_"
													></a>
													<table
														width="100%"
														cellpadding="0"
														border="0"
														height="30"
														cellspacing="0"
													>
														<tbody>
															<tr>
																<td valign="top" height="30">
																	<img
																		width="20"
																		height="30"
																		style="
																			display: block;
																			max-height: 30px;
																			max-width: 20px;
																		"
																		alt=""
																		src="https://ci6.googleusercontent.com/proxy/QwP933lbh8FNf3vxaSbQ1zzp5Q1CZga2iUNt2DrCXvUG5ZxDcst8sbIz4s5ab0ty-3XauXmqYhANX6I_46DF1f88lDYOGhTzResbH-AZ60H1uLSauN1AGvhU395VmDxAm86WZ0q4e0NU8CefwaCahx4H-gGgk-N1P_wV5pNVjjtqVWzqWJvfoFjqcyDXF7dtfJ2WuozhXwPTV6TtWrloddMTSu4ndbyJxFJjop8ha_C_0sgEJKAJiOlTiaYq5pB58VihyWdudvH9uoDzEU_Q8R-aeP97yfOP5tBFx5K_X5AjTh3ZNZRig4YZGnFr8gmmwpPtxidYHLDjs6D0AjnWg239msTXwWm1ssVKkIR5B2p31vPV61Lm0PEu-hRs2iAnDnCDKwFhL3Zeo-Bk1PgiV3i10xJ4s8phTOOJM7P8y9HBKmjCYOIGym90zB8JerBuEIuO72jgvRWZ1EuS2d9ngDNhLGK7Q41lAYi_czdR=s0-d-e1-ft#https://r.sb.ringover.com/im/1392961/f3c414c98b19f5414edf4dbd6d787ab431715f284bfaa8c4d5c248a604c20ea1.gif?e=mRYgM2oBRIsKcVyXvkJe9MtMvZIQYJNi0XxoZD3cfNWJmTJMRy2GcwgIWXP5F9hbwnSPBvZGqcjYvS6IM3KOpVS2CbpOO8vF86zxcCUaoZFCktUbjLjaGCQxALz36w1_nQbMs9PR9wHEe1ACi1CYQcP2crn9SIV38c_mBlmTorvRUKL4Y2aztKnq3LHSgalS1S3xjzkqzXaWydAkAf7zhFdvtrj9PiFuxqAQRVL2uAnrtQ"
																		class="CToWUd"
																		data-bit="iit"
																	/>
																</td>
															</tr>
														</tbody>
													</table>
												</td>
											</tr>
										</tbody>
									</table>
								</td>
							</tr>
							<tr>
								<td align="center" valign="top">
									<div style="background-color: rgb(249, 250, 252)">
										<table
											width="100%"
											cellpadding="0"
											border="0"
											cellspacing="0"
											style="min-width: 590px"
											name="Layout_5"
											id="m_852426457734446249m_2762524079405586479m_-3152227415448163846m_-515664811609128119Layout_5"
										>
											<tbody>
												<tr>
													<td
														align="center"
														valign="top"
														bgcolor="#f9fafc"
														style="min-width: 590px; background-color: rgb(249, 250, 252)"
													>
														<a
															href="#m_852426457734446249_m_2762524079405586479_m_-3152227415448163846_m_-515664811609128119_"
															name="m_852426457734446249_m_2762524079405586479_m_-3152227415448163846_m_-515664811609128119_Layout_5"
														></a>
														<table
															width="590"
															cellpadding="0"
															border="0"
															align="center"
															cellspacing="0"
														>
															<tbody>
																<tr>
																	<td
																		height="20"
																		style="font-size: 1px; line-height: 20px"
																	>
																		&nbsp;
																	</td>
																</tr>
																<tr>
																	<td
																		valign="top"
																		style="
																			font-size: 14px;
																			font-family: Arial, Helvetica, sans-serif;
																			color: #888888;
																		"
																		align="left"
																	>
																		<table
																			width="100%"
																			border="0"
																			cellpadding="0"
																			cellspacing="0"
																		>
																			<tbody>
																				<tr>
																					<th
																						style="
																							padding-right: 20px;
																							padding-left: 20px;
																							font-weight: normal;
																						"
																						valign="top"
																					>
																						<table
																							border="0"
																							valign="top"
																							cellspacing="0"
																							cellpadding="0"
																							width="264"
																							align="left"
																							style="border-bottom: 0"
																						>
																							<tbody>
																								<tr>
																									<td valign="top">
																										<table
																											cellpadding="0"
																											border="0"
																											align="left"
																											cellspacing="0"
																										>
																											<tbody>
																												<tr>
																													<td
																														valign="middle"
																														align="left"
																														style="
																															font-size: 14px;
																															font-family: Arial,
																																Helvetica, sans-serif;
																															color: #888888;
																															line-height: 16px;
																														"
																													>
																														<div>
																															<div>
																																<div>
																																	Ringover Group<br />
																																	50 bis, Rue Maurice
																																	Arnoux<br />
																																	92120 Montrouge, France
																																</div>
																															</div>
																														</div>
																													</td>
																												</tr>
																											</tbody>
																										</table>
																									</td>
																								</tr>
																							</tbody>
																						</table>
																					</th>
																					<th valign="top" style="padding-right: 15px">
																						<table
																							border="0"
																							valign="top"
																							cellspacing="0"
																							cellpadding="0"
																							width="246"
																							align="right"
																						>
																							<tbody>
																								<tr>
																									<td valign="top">
																										<table
																											cellpadding="0"
																											border="0"
																											cellspacing="0"
																											style="float: right"
																											align="right"
																										>
																											<tbody>
																												<tr>
																													<td
																														valign="middle"
																														width=""
																														align="right"
																													></td>
																												</tr>
																											</tbody>
																										</table>
																									</td>
																								</tr>
																							</tbody>
																						</table>
																					</th>
																				</tr>
																			</tbody>
																		</table>
																	</td>
																</tr>
																<tr>
																	<td
																		height="20"
																		style="font-size: 1px; line-height: 20px"
																	>
																		&nbsp;
																	</td>
																</tr>
															</tbody>
														</table>
													</td>
												</tr>
											</tbody>
										</table>
									</div>
								</td>
							</tr>
							<tr>
								<td align="center" valign="top">
									<div style="background-color: rgb(249, 250, 252)">
										<table
											width="100%"
											cellpadding="0"
											border="0"
											cellspacing="0"
											style="min-width: 590px"
											name="Layout_7"
											id="m_852426457734446249m_2762524079405586479m_-3152227415448163846m_-515664811609128119Layout_7"
										>
											<tbody>
												<tr>
													<td align="center" valign="top" style="min-width: 590px">
														<a
															href="#m_852426457734446249_m_2762524079405586479_m_-3152227415448163846_m_-515664811609128119_"
															name="m_852426457734446249_m_2762524079405586479_m_-3152227415448163846_m_-515664811609128119_Layout_7"
														></a>
														<table
															width="100%"
															cellpadding="0"
															border="0"
															align="center"
															cellspacing="0"
															bgcolor="#f9fafc"
															style="
																padding-right: 20px;
																padding-left: 20px;
																background-color: rgb(249, 250, 252);
															"
														>
															<tbody>
																<tr>
																	<td
																		height="20"
																		style="font-size: 1px; line-height: 20px"
																	>
																		&nbsp;
																	</td>
																</tr>
																<tr>
																	<td
																		style="
																			font-size: 14px;
																			color: #888888;
																			font-weight: normal;
																			text-align: center;
																			font-family: Arial, Helvetica, sans-serif;
																		"
																	>
																		<div>© 2023 BJT Partners</div>
																	</td>
																</tr>
																<tr>
																	<td
																		height="20"
																		style="font-size: 1px; line-height: 20px"
																	>
																		&nbsp;
																	</td>
																</tr>
															</tbody>
														</table>
													</td>
												</tr>
											</tbody>
										</table>
									</div>
								</td>
							</tr>
						</tbody>
					</table>
				</td>
			</tr>
		</tbody>
	</table>

	<img
		width="1"
		height="1"
		src="https://ci6.googleusercontent.com/proxy/k3MvsdL-0_4EsYb2FLPRfI5Kgfka-Zij0KAX_lCGVEJIwkhH0D_fUD6C-Hn5PzOJdBeSsZc45k-zX9Q2f5BllvM6-tfaTxyvCpFf6-fHNOIICGjf9er8DuNfOj6KPhdjvIGnh1Wd3hgd5uecfJ1Y0XbVqUMyUtII00zKVrxLRXfYJooknGVXzniYARJP-D_xlRAD8--qdJ06F7FxVeEejWO-Py-_F0QJhhgmTl3MzjyxV5wiEFPQKgLdGPg9EZ7QpJY6KWB_4B5WLsMPCypjIO-G3oQaixDrHEo=s0-d-e1-ft#https://r.sb.ringover.com/tr/op/_t6NL37JE5YIpN_7Z40EVVOCIKfXhTbZy2yMNfaJWUlAVZSpTS9L-A3Y8ck4oaacnT80cSiRxpGrqKaBDFzaykdlGlccPNwdQvwVgJUN2ZWEaR45j-lZSxc2Lx28Ewq9lGNS9Q9oL1POKUXlZDAfY01NVEZmfVEUuQOIFw"
		alt=""
		class="CToWUd"
		data-bit="iit"
	/>
</div>
  </body>
</html>
`;
};

module.exports = inviteMailForSuperAdmin;
